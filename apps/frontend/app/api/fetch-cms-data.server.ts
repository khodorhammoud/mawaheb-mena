export async function fetchCMSData(queries: string[]) {
  const responses = [];

  // Iterate over all the queries
  for (const query of queries) {
    try {
      const data = await fetchQueryData(query); // Wait for each query response
      if (data && data.data) {
        // Check if the query succeeded
        responses.push(data);
      } else {
        console.warn(`No valid data for query: ${query}`);
        responses.push(null); // Push null if data is invalid or missing
      }
    } catch (error) {
      console.error(`Error processing query: ${query}`, error);
      responses.push(null); // Push null in case of an error
    }
  }

  // Return all responses (including null for failed/missing queries)
  return responses;

  // Helper function to execute a single query
  async function fetchQueryData(query: string) {
    try {
      const response = await fetch(`${process.env.CMS_BASE_URL}/api/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query, // Send the query in the POST request body
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching query data:", query, error);
      return null; // Return null in case of a fetch error
    }
  }
}
