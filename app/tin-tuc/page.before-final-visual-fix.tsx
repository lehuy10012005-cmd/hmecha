import Link from "next/link";
import { articles } from "@/data/articles";

export default function NewsPage() {
  return (
    <main className="newsListPage min-h-screen px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 text-sm text-slate-600">
          <Link href="/" className="text-red-600">
            Trang chủ
          </Link>{" "}
          / Tin tức
        </div>

        <h1 className="mb-8 text-4xl font-black">
          Tin tức <span className="text-red-600">HMECHA</span>
        </h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/tin-tuc/${article.slug}`}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-red-300 hover:shadow-lg"
            >
              <img
                src={article.image}
                alt={article.title}
                className="h-48 w-full object-cover"
              />

              <div className="p-5">
                <div className="mb-3 flex justify-between gap-3 text-xs text-slate-500">
                  <span className="font-bold text-red-600">
                    {article.category}
                  </span>
                  <span>{article.date}</span>
                </div>

                <h2 className="mb-3 line-clamp-3 text-lg font-black text-slate-950">
                  {article.title}
                </h2>

                <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                  {article.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}