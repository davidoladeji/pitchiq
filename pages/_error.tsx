import { NextPageContext } from "next";

function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
        {statusCode ? `${statusCode} Error` : "An error occurred"}
      </h1>
      <a href="/" style={{ marginTop: "1rem", color: "#4361ee" }}>Go to PitchIQ</a>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
