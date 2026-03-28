export async function fetchQuestions(teacherId) {
  try {
    const res = await fetch(`http://localhost:5000/api/questions/${teacherId}`);

    if (!res.ok) {
      throw new Error("Failed to fetch questions");
    }

    return res.json();
  } catch (error) {
    console.log("Failed to fetch questions error: ", error);
  }
}
