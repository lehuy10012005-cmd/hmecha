"use client";

import { useMemo, useState } from "react";

type ProductImage = {
  image_url: string;
  sort_order?: number | null;
};

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const sortedImages = useMemo(() => {
    return [...(images || [])]
      .filter((img) => img.image_url)
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  }, [images]);

  const fallbackImage =
    "https://bizweb.dktcdn.net/assets/themes_support/noimage.gif";

  const galleryImages =
    sortedImages.length > 0
      ? sortedImages
      : [{ image_url: fallbackImage, sort_order: 0 }];

  const [activeImage, setActiveImage] = useState(galleryImages[0].image_url);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  return (
    <>
      <div className="productGallery">
        <button
          type="button"
          className="mainImageBox"
          onClick={() => setIsZoomOpen(true)}
          title="Bấm để phóng to ảnh"
        >
          <img src={activeImage} alt={productName} />
          <span className="zoomHint">Bấm để phóng to</span>
        </button>

        <div className="thumbList">
          {galleryImages.map((image, index) => (
            <button
              type="button"
              key={`${image.image_url}-${index}`}
              className={
                activeImage === image.image_url ? "thumb active" : "thumb"
              }
              onClick={() => setActiveImage(image.image_url)}
              title={`Ảnh ${index + 1}`}
            >
              <img src={image.image_url} alt={`${productName} ${index + 1}`} />
            </button>
          ))}
        </div>
      </div>

      {isZoomOpen && (
        <div className="imageZoomOverlay" onClick={() => setIsZoomOpen(false)}>
          <button
            type="button"
            className="zoomClose"
            onClick={() => setIsZoomOpen(false)}
          >
            ×
          </button>

          <img
            src={activeImage}
            alt={productName}
            className="zoomImage"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <style jsx>{`
        .productGallery {
          width: 100%;
        }

        .mainImageBox {
          position: relative;
          width: 100%;
          min-height: 430px;
          border: 1px solid rgba(0, 229, 255, 0.28);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.06);
          overflow: hidden;
          display: grid;
          place-items: center;
          cursor: zoom-in;
          padding: 14px;
        }

        .mainImageBox img {
          width: 100%;
          height: 100%;
          max-height: 430px;
          object-fit: contain;
          transition: transform 0.25s ease;
        }

        .mainImageBox:hover img {
          transform: scale(1.035);
        }

        .zoomHint {
          position: absolute;
          right: 16px;
          bottom: 16px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(5, 8, 22, 0.82);
          border: 1px solid rgba(0, 229, 255, 0.35);
          color: #00e5ff;
          font-size: 12px;
          font-weight: 900;
          opacity: 0;
          transform: translateY(8px);
          transition: 0.2s ease;
        }

        .mainImageBox:hover .zoomHint {
          opacity: 1;
          transform: translateY(0);
        }

        .thumbList {
          margin-top: 14px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .thumb {
          width: 76px;
          height: 76px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.08);
          overflow: hidden;
          padding: 4px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 10px;
        }

        .thumb:hover,
        .thumb.active {
          border-color: #00e5ff;
          box-shadow: 0 0 18px rgba(0, 229, 255, 0.35);
          transform: translateY(-2px);
        }

        .imageZoomOverlay {
          position: fixed;
          inset: 0;
          z-index: 999999;
          background: rgba(0, 0, 0, 0.88);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          cursor: zoom-out;
        }

        .zoomImage {
          max-width: 94vw;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 18px;
          background: #050816;
          box-shadow: 0 0 55px rgba(0, 229, 255, 0.36);
          cursor: default;
        }

        .zoomClose {
          position: fixed;
          top: 24px;
          right: 28px;
          width: 46px;
          height: 46px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
          color: #050816;
          font-size: 32px;
          font-weight: 950;
          line-height: 42px;
          cursor: pointer;
          z-index: 1000000;
        }

        @media (max-width: 768px) {
          .mainImageBox {
            min-height: 320px;
          }

          .mainImageBox img {
            max-height: 320px;
          }

          .thumb {
            width: 64px;
            height: 64px;
          }
        }
      `}</style>
    </>
  );
}