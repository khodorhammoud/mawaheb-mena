export async function fetchCMSData(query: string) {
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

    const { data } = await response.json();
    console.log("Fetched data: ", data);
    return data;
  } catch (error) {
    console.error("Error fetching HowItWorks data:", error);
  }
}
