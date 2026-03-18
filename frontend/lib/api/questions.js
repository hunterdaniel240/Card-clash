export async function fetchQuestions(teacherId) {
  const res = await fetch(`http://localhost:5000/api/questions/${teacherId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch questions");
  }

  return res.json();
}
