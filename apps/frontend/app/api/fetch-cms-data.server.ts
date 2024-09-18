// TODO: optimise the number of query calls made in this function, make it 1 query call per page
export async function fetchCMSData(queries: string[]) {
  console.log("Fetching data with queries: ", queries);

  const response = [];

  for (const query of queries) {
    const data = await fetchQueryData(query);
    if (data) {
      response.push(data);
    }
  }

  return response;

  async function fetchQueryData(query: string) {
    try {
      const response = await fetch(`${process.env.CMS_BASE_URL}/api/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
        }),
      });

      const data = await response.json();
      console.log("Fetched data: ", data);
      return data;
    } catch (error) {
      console.error(
        "Error fetching query data:" + JSON.stringify(query),
        error
      );
      return null;
    }
  }
}
