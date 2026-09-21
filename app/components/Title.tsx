const Title = () => {
    return (
        <h1 className="w-full" aria-label="HYDROXIOS">
        <svg
          aria-hidden="true"
          className="h-auto w-full max-w-5xl"
          viewBox="0 0 840 150"
          role="img"
        >
          <defs>
            <linearGradient
              id="hydroxios-rainbow"
              gradientUnits="userSpaceOnUse"
              spreadMethod="repeat"
              x1="-720"
              x2="0"
              y1="720"
              y2="0"
            >
              <stop offset="0%" stopColor="#ff3b30" />
              <stop offset="18%" stopColor="#ffcc00" />
              <stop offset="34%" stopColor="#34c759" />
              <stop offset="52%" stopColor="#00c7ff" />
              <stop offset="70%" stopColor="#5856d6" />
              <stop offset="86%" stopColor="#ff2d95" />
              <stop offset="100%" stopColor="#ff3b30" />
              <animateTransform
                attributeName="gradientTransform"
                type="translate"
                from="0 0"
                to="720 -720"
                dur="7s"
                repeatCount="indefinite"
              />
            </linearGradient>
          </defs>
          <text
            x="420"
            y="102"
            textAnchor="middle"
            fill="none"
            stroke="url(#hydroxios-rainbow)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fontFamily="Arial Black, var(--font-geist-sans), Arial, sans-serif"
            className="text-[98px] font-black"
          >
            HYDROXIOS
          </text>
        </svg>
      </h1>
    )
}

export default Title;
