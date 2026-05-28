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
          background:
            radial-gradient(circle at top left, rgba(124, 77, 255, 0.24), transparent 34%),
            radial-gradient(circle at top right, rgba(0, 229, 255, 0.18), transparent 30%),
            radial-gradient(circle at bottom, rgba(255, 79, 216, 0.13), transparent 36%),
            linear-gradient(180deg, #050816 0%, #0b1026 52%, #050816 100%);
          color: #ffffff;
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
          color: #b8c4e6;
          font-size: 14px;
        }

        .breadcrumb a {
          color: #00e5ff;
          text-decoration: none;
          font-weight: 800;
        }

        .breadcrumb strong {
          color: #ffffff;
        }

        .articleCard {
          overflow: hidden;
          border-radius: 30px;
          border: 1px solid rgba(0, 229, 255, 0.22);
          background: rgba(5, 8, 22, 0.9);
          box-shadow: 0 28px 90px rgba(0, 0, 0, 0.48);
        }

        .heroImage {
          position: relative;
          background: #0b1026;
        }

        .heroImage::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(5, 8, 22, 0) 45%,
            rgba(5, 8, 22, 0.78) 100%
          );
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
          background: rgba(0, 229, 255, 0.1);
          border: 1px solid rgba(0, 229, 255, 0.24);
          color: #c8f9ff;
          font-size: 13px;
          font-weight: 900;
        }

        h1 {
          margin: 0;
          font-size: clamp(32px, 5vw, 56px);
          line-height: 1.08;
          letter-spacing: -0.04em;
          color: #ffffff;
          text-shadow: 0 0 24px rgba(0, 229, 255, 0.13);
        }

        .excerpt {
          margin: 24px 0 22px;
          padding-left: 18px;
          border-left: 4px solid #00e5ff;
          color: #dbeafe;
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
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.13);
          color: #dce6ff;
          font-size: 13px;
          font-weight: 800;
        }

        .contentDivider {
          height: 1px;
          margin: 34px 0;
          background: linear-gradient(
            90deg,
            rgba(0, 229, 255, 0),
            rgba(0, 229, 255, 0.55),
            rgba(255, 79, 216, 0)
          );
        }

        .articleSection {
          margin-bottom: 38px;
        }

        .articleSection h2 {
          display: flex;
          align-items: center;
          gap: 13px;
          margin: 0 0 16px;
          color: #ffffff;
          font-size: clamp(24px, 3vw, 34px);
          line-height: 1.22;
        }

        .articleSection h2 span {
          flex: 0 0 auto;
          color: #00e5ff;
          font-size: 15px;
          border: 1px solid rgba(0, 229, 255, 0.3);
          background: rgba(0, 229, 255, 0.08);
          border-radius: 999px;
          padding: 7px 10px;
          font-weight: 950;
        }

        .articleSection p {
          color: #d4ddf7;
          font-size: 17px;
          line-height: 1.92;
          margin: 15px 0;
        }

        .articleSection ul {
          margin: 18px 0 0;
          padding: 18px 20px;
          list-style: none;
          border-radius: 20px;
          background: linear-gradient(
            135deg,
            rgba(124, 77, 255, 0.16),
            rgba(0, 229, 255, 0.08)
          );
          border: 1px solid rgba(0, 229, 255, 0.18);
        }

        .articleSection li {
          position: relative;
          padding-left: 24px;
          color: #eaf1ff;
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
          background: #00e5ff;
          box-shadow: 0 0 12px rgba(0, 229, 255, 0.75);
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
          color: #06101f;
          background: linear-gradient(135deg, #00e5ff, #7c4dff);
          box-shadow: 0 12px 32px rgba(0, 229, 255, 0.22);
        }

        .secondaryBtn {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
        }

        .relatedBox {
          margin-top: 36px;
        }

        .relatedBox h2 {
          margin: 0 0 18px;
          color: #ffffff;
          font-size: 30px;
        }

        .relatedBox h2 span {
          color: #00e5ff;
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
          border-radius: 18px;
          color: white;
          text-decoration: none;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(0, 229, 255, 0.14);
          transition: 0.2s ease;
        }

        .relatedCard:hover {
          transform: translateY(-3px);
          border-color: rgba(0, 229, 255, 0.45);
        }

        .relatedCard img {
          width: 96px;
          height: 74px;
          object-fit: cover;
          border-radius: 13px;
          background: #111827;
        }

        .relatedCard small {
          color: #00e5ff;
          font-weight: 850;
        }

        .relatedCard h3 {
          margin: 5px 0 0;
          font-size: 14px;
          line-height: 1.35;
          color: #ffffff;
        }

        @media (max-width: 640px) {
          .articlePage {
            padding: 22px 12px 76px;
          }

          .articleCard {
            border-radius: 22px;
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