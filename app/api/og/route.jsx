import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "96px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
        background: "linear-gradient(135deg, #0D5F3A 0%, #1a8a52 100%)",
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(122, 136, 84, 0.1)",
          top: "-100px",
          right: "-100px",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: "rgba(232, 166, 40, 0.08)",
          bottom: "-50px",
          left: "-50px",
        }}
      />

      {/* Left side - Logo/Icon */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background: "rgba(232, 166, 40, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "80px",
          }}
        >
          🍳
        </div>
      </div>

      {/* Right side - Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "32px",
          flex: 1,
          marginLeft: "64px",
          zIndex: 10,
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: "88px",
            fontWeight: "700",
            color: "white",
            lineHeight: "1",
            letterSpacing: "-2px",
            margin: 0,
          }}
        >
          MealMuse
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "36px",
            color: "#E8A628",
            fontWeight: "500",
            margin: 0,
          }}
        >
          AI-Powered Recipe Assistant
        </div>

        {/* Divider */}
        <div
          style={{
            width: "200px",
            height: "3px",
            background: "#E8A628",
            opacity: 0.6,
          }}
        />

        {/* Features */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            fontSize: "22px",
            color: "#E5D1DA",
          }}
        >
          <div>🍳 Discover curated recipes</div>
          <div>✍️ Create & share your own</div>
          <div>💬 AI Chef cooking tips</div>
        </div>

        {/* Domain */}
        <div
          style={{
            fontSize: "24px",
            color: "#E8A628",
            fontWeight: "600",
            marginTop: "20px",
          }}
        >
          mymealmuse.com
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
