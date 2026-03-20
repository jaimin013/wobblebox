import Navbar from "@/components/Navbar";
import SignUpForm from "@/components/SignUpForm";

function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Navbar />
      <main className="flex-1 flex justify-center items-center p-6 bg-zinc-50/80 dark:bg-zinc-900/40">
        <SignUpForm />
      </main>

      <footer className="bg-zinc-900 text-white py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Wobblebox. All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}

export default SignUpPage;
