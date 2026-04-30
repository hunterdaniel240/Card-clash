"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchQuestions } from "@/lib/api/questions";

import Loading from "@/components/Loading";

const server_url =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_PROD_SERVER_URL
    : process.env.NEXT_PUBLIC_DEV_SERVER_URL;

export default function QuestionsPage() {
  const { user } = useAuth() as { user: any };
  const [showModal, setShowModal] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "A",
  });

  const router = useRouter();
  const teacher_id = user?.id ?? null;

  const punctuationPattern = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cg font-family='Arial Black, sans-serif' font-weight='900' font-size='150' fill='black' fill-opacity='0.12'%3E%3Ctext x='20' y='140' transform='rotate(-5 50 100)'%3E?%3C/text%3E%3Ctext x='220' y='180' transform='rotate(15 280 140)'%3E!%3C/text%3E%3Ctext x='110' y='360' transform='rotate(-12 150 320)'%3E✓%3C/text%3E%3Ctext x='280' y='380' transform='rotate(8 320 350)' font-size='100'%3E?%3C/text%3E%3C/g%3E%3C/svg%3E")`,
    backgroundSize: "400px 400px",
  };

  const loadQuestions = async () => {
    if (!teacher_id) {
      setLoading(false);
      return;
    }

    try {
      const data = await fetchQuestions(teacher_id);
      if (!data) throw new Error("Failed to load questions");
      setQuestions(data);
    } catch (error) {
      console.log("Loading Questions error: ", error);
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();

    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddQuestion = async () => {
    if (!teacher_id) {
      setError("No teacher account found");
      return;
    }

    const payload = {
      teacher_id,
      ...form,
    };

    try {
      const res = await fetch(`${server_url}/api/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add question");

      setShowModal(false);
      setForm({
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_option: "A",
      });

      loadQuestions();
    } catch (error) {
      console.log("Adding Question error: ", error);
      setError("Failed to add question");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${server_url}/api/questions/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete question");
      loadQuestions();
    } catch (error) {
      console.log("Deleting Question error: ", error);
      setError("Failed to delete question");
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <>
      <style>{`
        @keyframes bg-pulse {
          0%, 49% { background-color: #fdba74; }
          50%, 100% { background-color: #c084fc; }
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
        <div
          className="absolute inset-[-100%] z-0 rotate-[-10deg] pointer-events-none animate-drift"
          style={punctuationPattern}
        />

        <div className="relative z-10 w-full max-w-[600px] border-[6px] border-black bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-[6px] border-black bg-cyan-400 p-8 text-center">
            <h1 className="text-5xl font-black uppercase italic text-black tracking-tighter">
              Questions
            </h1>
          </div>

          <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowModal(true)}
                className="border-4 border-black bg-yellow-300 px-6 py-3 text-lg font-black uppercase text-black cursor-pointer transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
              >
                Add Question
              </button>
            </div>

            {error && (
              <div className="border-4 border-black bg-red-300 p-4 text-center text-lg font-black uppercase text-black">
                {error}
              </div>
            )}

            {!teacher_id && (
              <div className="border-4 border-black bg-white p-6 text-center text-black">
                <p className="font-black uppercase text-xl">
                  No logged-in teacher found.
                </p>
                <p className="mt-2 font-bold">
                  Questions cannot load until authentication is restored.
                </p>
              </div>
            )}

            {loading ? (
              <p className="font-black italic uppercase text-center">
                Loading Questions
              </p>
            ) : (
              <div className="border-4 border-black p-6 bg-white space-y-4 text-black">
                {questions?.length === 0 ? (
                  <p className="font-black uppercase text-2xl italic tracking-tight text-center">
                    No questions yet.
                  </p>
                ) : (
                  questions.map((q) => (
                    <div
                      key={q.id}
                      className="border-4 border-black p-4 flex justify-between items-center text-black"
                    >
                      <div>
                        <p className="font-bold">{q.question_text}</p>
                        <p className="text-sm">Correct: {q.correct_option}</p>
                      </div>

                      <button
                        onClick={() => handleDelete(q.id)}
                        className="border-2 border-black px-3 py-1 font-bold bg-red-400 text-black cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={() => {
                  router.push("/dashboard");
                }}
                className="w-full border-4 border-black bg-white p-4 text-lg font-black uppercase text-black cursor-pointer transition-all hover:bg-black hover:text-white"
              >
                Back to menu
              </button>
            </div>

            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 overflow-y-auto">
                <div className="w-full max-w-xl border-[6px] border-black bg-white shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                  <div className="border-b-[6px] border-black bg-yellow-300 px-6 py-4">
                    <h2 className="text-3xl font-black uppercase italic tracking-tight">
                      Add Question
                    </h2>
                  </div>

                  <div className="space-y-4 p-6 text-black">
                    <input
                      name="question_text"
                      placeholder="Question"
                      value={form.question_text}
                      onChange={handleChange}
                      className="w-full border-4 border-black p-3 text-lg font-bold"
                    />

                    <input
                      name="option_a"
                      placeholder="Option A"
                      value={form.option_a}
                      onChange={handleChange}
                      className="w-full border-4 border-black p-3 text-lg font-bold"
                    />

                    <input
                      name="option_b"
                      placeholder="Option B"
                      value={form.option_b}
                      onChange={handleChange}
                      className="w-full border-4 border-black p-3 text-lg font-bold"
                    />

                    <input
                      name="option_c"
                      placeholder="Option C"
                      value={form.option_c}
                      onChange={handleChange}
                      className="w-full border-4 border-black p-3 text-lg font-bold"
                    />

                    <input
                      name="option_d"
                      placeholder="Option D"
                      value={form.option_d}
                      onChange={handleChange}
                      className="w-full border-4 border-black p-3 text-lg font-bold"
                    />

                    <div>
                      <p className="font-black uppercase mb-2">
                        Correct Answer
                      </p>

                      <div className="flex gap-4">
                        {["A", "B", "C", "D"].map((letter) => (
                          <label key={letter} className="font-bold">
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
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => setShowModal(false)}
                        className="border-4 border-black bg-red-400 px-5 py-3 font-black uppercase"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleAddQuestion}
                        className="border-4 border-black bg-green-400 px-5 py-3 font-black uppercase transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                      >
                        Add Question
                      </button>
                    </div>
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
