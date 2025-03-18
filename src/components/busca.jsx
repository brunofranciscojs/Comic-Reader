import { useState } from "react";

export default function Busca({ setBusca }) {

  return (
    <>
      <input
        type="text"
        placeholder="Buscar arquivo..."
        onInput={(e) => setBusca(e.target.value)}
        className="border p-2 w-full text-gray-800"
      />
    </>
  );
}
