import { useState } from "react";

export default function QuestionSelection({
  user,
  questions,
  questionsSelected,
  setQuestionsSelected,
  loading,
}) {
  // checkbox handler
  const handleQuestionToggle = (question) => {
    // unselect question
    if (questionsSelected.some((q) => q.id === question.id)) {
      setQuestionsSelected(
        questionsSelected.filter((q) => q.id !== question.id),
      );
    } else {
      // select question
      setQuestionsSelected([...questionsSelected, question]);
    }
  };

  return (
    <>
      {/* QUESTIONS PANEL */}
      {user?.role === "teacher" && (
        <div className="w-[400px] border-[6px] border-black bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-[6px] border-black bg-yellow-300 p-6 text-center">
            <h2 className="text-3xl font-black uppercase italic tracking-tight">
              Questions
            </h2>
          </div>

          <div className="p-6 space-y-3 max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-200 animate-pulse border-4 border-black"
                  />
                ))}
              </div>
            ) : questions.length === 0 ? (
              <p className="font-black italic uppercase text-center">
                No Questions
              </p>
            ) : (
              questions.map((q) => (
                <label
                  key={q.id}
                  className="flex items-start gap-3 border-4 border-black p-3 font-bold cursor-pointer hover:bg-yellow-100"
                >
                  <input
                    type="checkbox"
                    checked={questionsSelected.some(
                      (selection) => selection.id === q.id,
                    )}
                    onChange={() => handleQuestionToggle(q)}
                    className="mt-1"
                  />

                  <span>{q.question_text}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
