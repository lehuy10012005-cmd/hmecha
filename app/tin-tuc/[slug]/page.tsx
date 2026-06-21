import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, getRelatedArticles } from "@/data/articles";

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(article.slug);

  return (
    <main className="articlePage">
      <div className="articleContainer">
        <nav className="breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span>/</span>
          <Link href="/tin-tuc">Tin tức</Link>
          <span>/</span>
          <strong>{article.category}</strong>
        </nav>

        <article className="articleCard">
          <div className="heroImage">
            <img src={article.image} alt={article.title} />
          </div>

          <div className="articleContent">
            <div className="meta">
              <span>{article.category}</span>
              <span>{article.date}</span>
              <span>Đăng bởi: {article.author}</span>
            </div>

            <h1>{article.title}</h1>

            <p className="excerpt">{article.excerpt}</p>

            <div className="tagList">
              {article.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>

            <div className="contentDivider" />

            <section className="articleBody">
              {article.sections.map((section, index) => (
                <div className="articleSection" key={section.heading}>
                  <h2>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {section.heading}
                  </h2>

                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}

                  {section.bullets && section.bullets.length > 0 && (
                    <ul>
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>

            <div className="actions">
              <Link href="/" className="primaryBtn">
                Về trang chủ
              </Link>

              <Link href="/tin-tuc" className="secondaryBtn">
                Xem tin tức khác
              </Link>
            </div>
          </div>
        </article>

        <section className="relatedBox">
          <h2>
            Bài viết <span>liên quan</span>
          </h2>

          <div className="relatedGrid">
            {relatedArticles.map((item) => (
              <Link
                key={item.slug}
                href={`/tin-tuc/${item.slug}`}
                className="relatedCard"
              >
                <img src={item.image} alt={item.title} />

                <div>
                  <small>{item.category} • {item.date}</small>
                  <h3>{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        .articlePage {
          min-height: 100vh;
          background: #f3f6fb;
          color: #111827;
          padding: 34px 18px 86px;
        }

        .articleContainer {
          max-width: 1100px;
          margin: 0 auto;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
          margin-bottom: 22px;
          color: #6b7280;
          font-size: 14px;
        }

        .breadcrumb a {
          color: #d32f2f;
          text-decoration: none;
          font-weight: 850;
        }

        .breadcrumb strong {
          color: #111827;
        }

        .articleCard {
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          box-shadow: 0 20px 55px rgba(15, 23, 42, 0.10);
        }

        .heroImage {
          position: relative;
          background: #ffffff;
        }

        .heroImage::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.22) 100%);
          pointer-events: none;
        }

        .heroImage img {
          width: 100%;
          height: min(490px, 52vw);
          min-height: 270px;
          object-fit: cover;
          display: block;
        }

        .articleContent {
          padding: clamp(24px, 5vw, 50px);
          background: #ffffff;
        }

        .meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
        }

        .meta span {
          border-radius: 999px;
          padding: 8px 13px;
          background: #fff7d6;
          border: 1px solid #ffc107;
          color: #111827;
          font-size: 13px;
          font-weight: 900;
        }

        h1 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(34px, 5vw, 58px);
          line-height: 1.08;
          letter-spacing: -0.045em;
          color: #111827;
          text-shadow: none;
        }

        .excerpt {
          margin: 24px 0 22px;
          padding: 14px 18px;
          border-left: 4px solid #d32f2f;
          border-radius: 0 14px 14px 0;
          background: #fff7f7;
          color: #374151;
          font-size: 19px;
          line-height: 1.75;
          font-weight: 750;
        }

        .tagList {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin: 22px 0;
        }

        .tagList span {
          border-radius: 999px;
          padding: 7px 11px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          color: #4b5563;
          font-size: 13px;
          font-weight: 800;
        }

        .contentDivider {
          height: 1px;
          margin: 34px 0;
          background: linear-gradient(90deg, rgba(211,47,47,0), rgba(211,47,47,.55), rgba(255,193,7,0));
        }

        .articleSection {
          margin-bottom: 38px;
        }

        .articleSection h2 {
          display: flex;
          align-items: center;
          gap: 13px;
          margin: 0 0 16px;
          color: #111827;
          font-size: clamp(24px, 3vw, 34px);
          line-height: 1.22;
          font-family: Georgia, "Times New Roman", serif;
          font-weight: 850;
        }

        .articleSection h2 span {
          flex: 0 0 auto;
          color: #111827;
          font-size: 15px;
          border: 1px solid #ffc107;
          background: #ffc107;
          border-radius: 999px;
          padding: 7px 10px;
          font-weight: 950;
        }

        .articleSection p {
          color: #1f2937;
          font-size: 17px;
          line-height: 1.92;
          margin: 15px 0;
        }

        .articleSection ul {
          margin: 18px 0 0;
          padding: 18px 20px;
          list-style: none;
          border-radius: 18px;
          background: #fff7d6;
          border: 1px solid #ffc107;
        }

        .articleSection li {
          position: relative;
          padding-left: 24px;
          color: #1f2937;
          line-height: 1.75;
          margin: 8px 0;
          font-size: 16px;
        }

        .articleSection li::before {
          content: "";
          position: absolute;
          left: 2px;
          top: 12px;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #d32f2f;
          box-shadow: none;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 36px;
        }

        .actions a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 13px 18px;
          text-decoration: none;
          font-weight: 950;
          transition: 0.2s ease;
        }

        .actions a:hover {
          transform: translateY(-2px);
        }

        .primaryBtn {
          color: #ffffff;
          background: #d32f2f;
          box-shadow: 0 12px 26px rgba(211, 47, 47, 0.22);
        }

        .primaryBtn:hover {
          background: #be1f2e;
        }

        .secondaryBtn {
          color: #d32f2f;
          background: #ffffff;
          border: 1px solid #d32f2f;
        }

        .secondaryBtn:hover {
          color: #111827;
          background: #ffc107;
          border-color: #ffc107;
        }

        .relatedBox {
          margin-top: 36px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          padding: 22px;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
        }

        .relatedBox h2 {
          margin: 0 0 18px;
          color: #111827;
          font-size: 30px;
          font-family: Georgia, "Times New Roman", serif;
          font-weight: 850;
        }

        .relatedBox h2 span {
          color: #d32f2f;
        }

        .relatedGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
        }

        .relatedCard {
          display: grid;
          grid-template-columns: 96px 1fr;
          gap: 13px;
          align-items: center;
          padding: 12px;
          border-radius: 16px;
          color: #111827;
          text-decoration: none;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
          transition: 0.2s ease;
        }

        .relatedCard:hover {
          transform: translateY(-3px);
          border-color: rgba(211, 47, 47, 0.36);
          box-shadow: 0 14px 28px rgba(211, 47, 47, 0.12);
        }

        .relatedCard img {
          width: 96px;
          height: 74px;
          object-fit: cover;
          border-radius: 13px;
          background: #ffffff;
        }

        .relatedCard small {
          color: #d32f2f;
          font-weight: 850;
        }

        .relatedCard h3 {
          margin: 5px 0 0;
          font-size: 14px;
          line-height: 1.35;
          color: #111827;
        }

        @media (max-width: 640px) {
          .articlePage {
            padding: 22px 12px 76px;
          }

          .articleCard {
            border-radius: 20px;
          }

          .heroImage img {
            min-height: 220px;
          }

          .articleContent {
            padding: 22px;
          }

          .articleSection h2 {
            align-items: flex-start;
          }

          .actions a {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}