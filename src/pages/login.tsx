import { useState } from "react";
import { supabase } from "@/lib/supabaseClients";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else window.location.href = "/"; // redirect to dashboard
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      <form onSubmit={handleLogin} className="p-6 bg-white rounded shadow-md space-y-4">
        <h2 className="text-xl font-bold">Login to Ruhmrita</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        <button type="submit" className="w-full bg-primary text-white py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}