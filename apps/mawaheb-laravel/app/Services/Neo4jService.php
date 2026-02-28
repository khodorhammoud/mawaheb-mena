<?php

namespace App\Services;

use Laudis\Neo4j\ClientBuilder;
use Laudis\Neo4j\Contracts\ClientInterface;

class Neo4jService
{
    private ?ClientInterface $client = null;

    private function getClient(): ClientInterface
    {
        if ($this->client === null) {
            $url = config('services.neo4j.url', 'bolt://localhost:7687');
            $username = config('services.neo4j.username', 'neo4j');
            $password = config('services.neo4j.password', 'password');

            $this->client = ClientBuilder::create()
                ->withDriver('default', "{$url}", \Laudis\Neo4j\Authentication\Authenticate::basic($username, $password))
                ->build();
        }

        return $this->client;
    }

    public function mapProfileToKnowledge(array $skills): array
    {
        $client = $this->getClient();

        $skillNames = array_map(fn ($s) => strtolower(trim($s)), $skills);

        // Find best matching domain and field
        $result = $client->run(
            'MATCH (s:Skill)-[:PART_OF|BELONGS_TO_GROUP|REQUIRES*1..3]-(parent)
             WHERE toLower(s.id) IN $skills
             WITH parent, count(s) as matchCount
             ORDER BY matchCount DESC
             LIMIT 5
             RETURN parent.id as id, parent.type as type, matchCount',
            ['skills' => $skillNames]
        );

        $domain = null;
        $field = null;
        $subfield = null;
        $category = null;

        foreach ($result as $record) {
            $type = $record->get('type');
            $id = $record->get('id');

            match ($type) {
                'Domain' => $domain = $domain ?? $id,
                'Field' => $field = $field ?? $id,
                'Subfield' => $subfield = $subfield ?? $id,
                'CompetencyGroup' => $category = $category ?? $id,
                default => null,
            };
        }

        // Find skill gaps
        $gaps = [];
        if ($subfield) {
            $gapResult = $client->run(
                'MATCH (sf {id: $subfield})-[:REQUIRES]->(s:Skill)
                 WHERE NOT toLower(s.id) IN $skills
                 RETURN s.id as skill',
                ['subfield' => $subfield, 'skills' => $skillNames]
            );

            foreach ($gapResult as $record) {
                $gaps[] = $record->get('skill');
            }
        }

        // Find strengths (matched skills that are required)
        $strengths = [];
        if ($subfield) {
            $strengthResult = $client->run(
                'MATCH (sf {id: $subfield})-[:REQUIRES]->(s:Skill)
                 WHERE toLower(s.id) IN $skills
                 RETURN s.id as skill',
                ['subfield' => $subfield, 'skills' => $skillNames]
            );

            foreach ($strengthResult as $record) {
                $strengths[] = $record->get('skill');
            }
        }

        // Find tools for the subfield
        $tools = [];
        if ($subfield) {
            $toolResult = $client->run(
                'MATCH (sf {id: $subfield})-[:USES]->(t:Tool)
                 RETURN t.id as tool',
                ['subfield' => $subfield]
            );

            foreach ($toolResult as $record) {
                $tools[] = $record->get('tool');
            }
        }

        // Find certifications
        $certifications = [];
        if ($subfield) {
            $certResult = $client->run(
                'MATCH (sf {id: $subfield})-[:REQUIRES_CERT]->(c:Certification)
                 RETURN c.id as cert',
                ['subfield' => $subfield]
            );

            foreach ($certResult as $record) {
                $certifications[] = $record->get('cert');
            }
        }

        return [
            'domain' => $domain,
            'field' => $field,
            'subfield' => $subfield,
            'category' => $category,
            'strengths' => $strengths,
            'weaknesses' => array_slice($gaps, 0, 5),
            'gaps' => $gaps,
            'tools' => $tools,
            'certifications' => $certifications,
        ];
    }

    public function seedKnowledgeGraph(array $graphData): void
    {
        $client = $this->getClient();

        // Create nodes
        foreach ($graphData['nodes'] ?? [] as $node) {
            $client->run(
                'MERGE (n {id: $id}) SET n:' . $node['type'] . ', n.type = $type',
                ['id' => $node['id'], 'type' => $node['type']]
            );
        }

        // Create edges
        foreach ($graphData['edges'] ?? [] as $edge) {
            $params = ['from' => $edge['from'], 'to' => $edge['to']];
            $setClause = '';

            if (isset($edge['level'])) {
                $setClause = ' SET r.level = $level';
                $params['level'] = $edge['level'];
            }

            $client->run(
                "MATCH (a {id: \$from}), (b {id: \$to})
                 MERGE (a)-[r:{$edge['type']}]->(b){$setClause}",
                $params
            );
        }
    }
}
