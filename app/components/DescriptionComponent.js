"use client"

import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function DescriptionComponent ({ description }) {
    const [isExpanded, setIsExpanded] = useState(false);
  
    const toggleDescription = () => {
      setIsExpanded(!isExpanded);
    };
  
      // 보여줄 텍스트의 제한 길이
    const maxPreviewLength = 100;
    const previewText = description.length > maxPreviewLength 
        ? description.slice(0, maxPreviewLength) + "..." 
        : description;
  
    return (
        <div className="mb-3">
        <p className="text-muted" style={{ fontSize: "16px", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
          {isExpanded ? description : previewText}
        </p>
        {description.length > maxPreviewLength && (
          <button 
            className="btn btn-outline-info btn-sm"
            onClick={toggleDescription}
            style={{ fontSize: "14px" }}
          >
            {isExpanded ? "접기 ▲" : "더보기 ▼"}
          </button>
        )}
      </div>
    );
  };