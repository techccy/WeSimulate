"use client";

import { MomentPost } from "@/types";

interface MomentPreviewProps {
  data: MomentPost;
  showComments?: boolean;
}

export default function MomentPreview({ data, showComments = true }: MomentPreviewProps) {
  const getImageGridClass = (count: number) => {
    switch (count) {
      case 1:
        return "grid-cols-1";
      case 2:
      case 4:
        return "grid-cols-2";
      case 3:
      case 6:
      case 9:
        return "grid-cols-3";
      case 5:
      case 7:
      case 8:
        return "grid-cols-3";
      default:
        return "grid-cols-2";
    }
  };

  return (
    <div className="post-container flex flex-row w-full max-w-[500px]">
      <div className="avatar-container mr-3">
        <img
          className="avatar w-[45px] h-[45px] rounded-[4px] bg-[#ddd] object-cover"
          src={data.avatar || "https://via.placeholder.com/100?text=Avatar"}
          alt="User Avatar"
        />
      </div>

      <div className="main-content flex-1">
        <div className="username text-[#576b95] font-semibold text-base mb-1 cursor-pointer">
          {data.nickname}
        </div>

        <div className="post-text text-[15px] leading-[1.5] mb-2.5">
          {data.content}
        </div>

        {data.images.length > 0 && (
          <div className={`grid ${getImageGridClass(data.images.length)} gap-1 mb-3 ${
            data.images.length <= 2 ? "w-[60%]" : "w-[90%]"
          }`}>
            {data.images.map((image, index) => (
              <div key={index} className={data.images.length > 1 ? "aspect-square" : ""}>
                <img
                  className={`post-image w-full rounded-[2px] bg-[#f5f5f5] ${
                    data.images.length === 1 
                      ? "object-contain" 
                      : "w-full h-full object-cover"
                  }`}
                  src={image}
                  alt={`Post Image ${index + 1}`}
                />
              </div>
            ))}
          </div>
        )}

        <div className="meta-bar flex justify-between items-center text-xs text-[#b1b1b1] mb-2.5">
          <span>
            {data.location && <span className="mr-2">{data.location}</span>}
            {data.timestamp}
          </span>
          <div className="more-icon bg-[#f7f7f7] px-[2.976] py-[0.9915] rounded-[4px] text-[#576b95] font-bold cursor-pointer">··</div>
        </div>

        {showComments && (data.likes.length > 0 || data.comments.length > 0) && (
          <div className="interaction-box bg-[#f7f7f7] rounded-[4px] relative p-2 text-sm">
            <div className="interaction-box-triangle absolute -top-2.5 left-2.5 border-[5px] border-solid border-transparent border-b-[#f7f7f7]" />

            {data.likes.length > 0 && (
              <div className="likes text-[#576b95] font-medium pb-1.5 border-b-[0.5px] border-[#eee] mb-1.5 flex items-center">
                ♥ {data.likes.join(", ")}
              </div>
            )}

            {data.comments.length > 0 && (
              <div className="comments">
                {data.comments.map((comment, index) => (
                  <div key={index} className="comment-item mb-1 leading-[1.4]">
                    <span className="comment-user text-[#576b95] font-medium">
                      {comment.user}：
                    </span>
                    <span className="comment-text text-black">{comment.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
