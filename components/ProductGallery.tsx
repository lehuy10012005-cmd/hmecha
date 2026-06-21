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

  const fallbackImage = "https://bizweb.dktcdn.net/assets/themes_support/noimage.gif";
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
          title="Bấm để xem ảnh lớn"
        >
          <img src={activeImage} alt={productName} />
        </button>

        <div className="thumbList">
          {galleryImages.map((image, index) => (
            <button
              type="button"
              key={`${image.image_url}-${index}`}
              className={activeImage === image.image_url ? "thumb active" : "thumb"}
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
            aria-label="Đóng"
          >
            ×
          </button>

          <img
            src={activeImage}
            alt={productName}
            className="zoomImage"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}

      <style jsx>{`
        .productGallery {
          width: 100%;
        }

        .mainImageBox {
          width: 100%;
          min-height: 420px;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          background: #f8fafc;
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
          transition: transform 0.2s ease;
        }

        .mainImageBox:hover img {
          transform: scale(1.025);
        }

        .thumbList {
          margin-top: 12px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .thumb {
          width: 68px;
          height: 68px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          overflow: hidden;
          padding: 4px;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 8px;
        }

        .thumb:hover,
        .thumb.active {
          border-color: #d32f2f;
          box-shadow: 0 4px 12px rgba(211, 47, 47, 0.16);
          transform: translateY(-1px);
        }

        .imageZoomOverlay {
          position: fixed;
          inset: 0;
          z-index: 999999;
          background: rgba(15, 23, 42, 0.86);
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
          border-radius: 14px;
          background: #ffffff;
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
          cursor: default;
        }

        .zoomClose {
          position: fixed;
          top: 22px;
          right: 24px;
          width: 44px;
          height: 44px;
          border-radius: 999px;
          border: 0;
          background: #ffffff;
          color: #111827;
          font-size: 30px;
          font-weight: 800;
          line-height: 40px;
          cursor: pointer;
          z-index: 1000000;
        }

        @media (max-width: 768px) {
          .mainImageBox {
            min-height: 300px;
          }

          .mainImageBox img {
            max-height: 300px;
          }

          .thumb {
            width: 60px;
            height: 60px;
          }
        }
      `}</style>
    </>
  );
}
