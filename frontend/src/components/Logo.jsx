import React from "react";

const Logo = ()=>{
    return(
        <div>
            <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        width="200"
        height="200"
      >
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e6002e" stopOpacity="1" />
            <stop offset="100%" stopColor="#ff4d70" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Inner Stylized Camera Icon */}
        <rect
          x="28"
          y="28"
          width="44"
          height="44"
          rx="10"
          fill="url(#iconGradient)"
        />
        <circle cx="50" cy="50" r="12" fill="url(#iconGradient)" />
        <circle cx="50" cy="50" r="8" fill="#fff" />
        <circle cx="40" cy="40" r="4" fill="#4d000f" />

        {/* Decorative Highlight Square */}
        <rect
          x="30"
          y="30"
          width=""
          height=""
          fill="none"
          stroke=""
          strokeWidth="2"
          strokeDasharray="4 2"
          rx="8"
        />

        {/* Project Name Text */}
        <text
          x="50"
          y="92"
          fontFamily="'Arial Black', Gadget, sans-serif"
          fontSize="12"
          fill="url(#iconGradient)"
          textAnchor="middle"
        >
          PicToChat
        </text>
      </svg>
        </div>
    )
}
 
export default Logo;