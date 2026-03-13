"use client";
<a href=""></a>;

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";

export default function QuestionsPage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const { questions, setQuestions } = useGame();

  const [form, setForm] = useState({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "A",
  });

  const router = useRouter();

  // TODO: replace with authenticated user id later
  const teacher_id = user.id;

  // Maintaining the exact randomized punctuation pattern for visual continuity
  const punctuationPattern = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cg font-family='Arial Black, sans-serif' font-weight='900' font-size='150' fill='black' fill-opacity='0.12'%3E%3Ctext x='20' y='140' transform='rotate(-5 50 100)'%3E?%3C/text%3E%3Ctext x='220' y='180' transform='rotate(15 280 140)'%3E!%3C/text%3E%3Ctext x='110' y='360' transform='rotate(-12 150 320)'%3E✓%3C/text%3E%3Ctext x='280' y='380' transform='rotate(8 320 350)' font-size='100'%3E?%3C/text%3E%3C/g%3E%3C/svg%3E")`,
    backgroundSize: "400px 400px",
  };

  // FETCH QUESTIONS
  async function fetchQuestions() {
    const res = await fetch(
      `http://localhost:5000/api/questions/${teacher_id}`,
    );
    const data = await res.json();
    setQuestions(data);
  }

  useEffect(() => {
    fetchQuestions();
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // ADD QUESTION
  async function handleAddQuestion() {
    const payload = {
      teacher_id,
      ...form,
    };

    await fetch("http://localhost:5000/api/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    setShowModal(false);

    setForm({
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "A",
    });

    fetchQuestions();
  }

  // DELETE QUESTION
  async function handleDelete(id) {
    await fetch(`http://localhost:5000/api/questions/${id}`, {
      method: "DELETE",
    });

    fetchQuestions();
  }

  return (
    <>
      <style>{`
        @keyframes bg-pulse {
          0%, 49% { background-color: #fdba74; } /* orange-300 */
          50%, 100% { background-color: #c084fc; } /* lavender */
        }
        
        @keyframes drift {
          from { background-position: 0 0; }
          to { background-position: 400px 400px; }
        }

        .animate-bg-flip {
          animation: bg-pulse 6s infinite;
        }

        .animate-drift {
          animation: drift 40s linear infinite;
        }
      `}</style>

      <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden animate-bg-flip">
        {/* SYMBOL LAYER */}
        <div
          className="absolute inset-[-100%] z-0 rotate-[-10deg] pointer-events-none animate-drift"
          style={punctuationPattern}
        />

        {/* Main Questions Card */}
        <div className="relative z-10 w-full max-w-[600px] border-[6px] border-black bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
          {/* Header */}
          <div className="border-b-[6px] border-black bg-cyan-400 p-8 text-center">
            <h1 className="text-5xl font-black uppercase italic text-black tracking-tighter">
              Questions
            </h1>
          </div>

          <div className="p-8 space-y-8">
            {/* Action Bar */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowModal(true)}
                className="border-4 border-black bg-yellow-300 px-6 py-3 text-lg font-black uppercase text-black transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
              >
                Add Question
              </button>
            </div>

            {/* Questions List Area */}
            <div className="border-4 border-black p-6 bg-white space-y-4">
              {questions.length === 0 ? (
                <p className="font-black uppercase text-2xl italic tracking-tight text-center">
                  No questions yet.
                </p>
              ) : (
                questions.map((q) => (
                  <div
                    key={q.id}
                    className="border-4 border-black p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold">{q.question_text}</p>
                      <p className="text-sm">Correct: {q.correct_option}</p>
                    </div>

                    <button
                      onClick={() => handleDelete(q.id)}
                      className="border-2 border-black px-3 py-1 font-bold bg-red-400"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Back to Lobby Link/Button */}
            <div className="pt-4">
              <button
                onClick={() => {
                  router.push("/dashboard");
                }}
                className="w-full border-4 border-black bg-white p-4 text-lg font-black uppercase text-black transition-all hover:bg-black hover:text-white"
              >
                Back to menu
              </button>
            </div>

            {showModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/50">
                <div className="bg-white p-6 rounded-lg w-96">
                  <h2 className="text-xl font-semibold mb-4">Add Question</h2>

                  <input
                    name="question_text"
                    placeholder="Question"
                    value={form.question_text}
                    onChange={handleChange}
                    className="border p-2 w-full mb-3 rounded"
                  />

                  <input
                    name="option_a"
                    placeholder="Option A"
                    value={form.option_a}
                    onChange={handleChange}
                    className="border p-2 w-full mb-2 rounded"
                  />

                  <input
                    name="option_b"
                    placeholder="Option B"
                    value={form.option_b}
                    onChange={handleChange}
                    className="border p-2 w-full mb-2 rounded"
                  />

                  <input
                    name="option_c"
                    placeholder="Option C"
                    value={form.option_c}
                    onChange={handleChange}
                    className="border p-2 w-full mb-2 rounded"
                  />

                  <input
                    name="option_d"
                    placeholder="Option D"
                    value={form.option_d}
                    onChange={handleChange}
                    className="border p-2 w-full mb-3 rounded"
                  />

                  <div className="mb-4">
                    <p className="font-semibold mb-2">Correct Answer</p>

                    {["A", "B", "C", "D"].map((letter) => (
                      <label key={letter} className="mr-4">
                        <input
                          type="radio"
                          name="correct_option"
                          value={letter}
                          checked={form.correct_option === letter}
                          onChange={handleChange}
                          className="mr-1"
                        />
                        {letter}
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleAddQuestion}
                      className="px-4 py-2 bg-green-500 text-white rounded"
                    >
                      Add
                    </button>

                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-400 text-white rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
