const server_url =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_PROD_SERVER_URL
    : process.env.NEXT_PUBLIC_DEV_SERVER_URL;

export async function fetchQuestions(teacherId) {
  try {
    const res = await fetch(`${server_url}/api/questions/${teacherId}`);

    if (!res.ok) {
      throw new Error("Failed to fetch questions");
    }

    return res.json();
  } catch (error) {
    console.log("Failed to fetch questions error: ", error);
  }
}
