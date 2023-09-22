import { Update } from "telegraf/types";
import Context from "../context";
import { studentList } from "../utils/database";
import { formatStudent } from "../utils/format";

const CACHE_TIPS = 0;
const CACHE_RESULT = 0;

export default async function inlineStudent(
  ctx: Context<Update.InlineQueryUpdate>
) {
  const { query } = ctx.inlineQuery;
  if (!query.trim()) {
    return ctx.answerInlineQuery(
      [
        {
          id: "tips",
          type: "article",
          title: "Начните вводить свою фамилию",
          input_message_content: {
            message_text: "/start",
          },
        },
      ],
      { cache_time: CACHE_TIPS }
    );
  }

  const results = studentList
    .filter((student) =>
      student.fullName.toLowerCase().startsWith(query.toLowerCase())
    )
    .slice(0, 10);
  return ctx.answerInlineQuery(
    results.length === 0
      ? [
          {
            id: "tips",
            type: "article",
            title: "Не удалось найти студента 😔",
            description: "Если фамилия введена правильно, то нажмите сюда",
            input_message_content: {
              message_text: "/auth",
            },
          },
        ]
      : results.map((student) => ({
          id: student.id.toString(),
          type: "article",
          title: student.fullName,
          description: formatStudent(student).department,
          input_message_content: {
            message_text: `/student ${student.id}`,
          },
        })),
    { cache_time: CACHE_RESULT }
  );
}
