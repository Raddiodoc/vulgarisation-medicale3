import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResponse(data.result);
    setLoading(false);
  };

  const handleAccess = () => {
    if (password === process.env.NEXT_PUBLIC_ACCESS_PASSWORD) {
      setAccessGranted(true);
    } else {
      alert("Mot de passe incorrect");
    }
  };

  if (!accessGranted) {
    return (
      <main className="flex flex-col items-center justify-center p-10 gap-6">
        <h1 className="text-2xl font-bold">Accès privé</h1>
        <input
          type="password"
          placeholder="Entrez le mot de passe"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleAccess}>Entrer</Button>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center p-10 gap-6">
      <h1 className="text-3xl font-bold text-center">
        Comprenez votre compte rendu médical
      </h1>
      <input
        type="file"
        accept=".pdf,.jpg,.png"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <Button onClick={handleUpload} disabled={!file || loading}>
        {loading ? "Traitement..." : "Analyser et Vulgariser"}
      </Button>
      {response && (
        <div className="p-4 bg-white rounded shadow w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-2">Votre rapport simplifié :</h2>
          <p className="whitespace-pre-wrap text-gray-800">{response}</p>
        </div>
      )}
    </main>
  );
}
