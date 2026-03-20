import { Button } from "@heroui/button";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Card, CardBody } from "@heroui/card";
import { CloudUpload, Image as ImageIcon, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen flex flex-col bg-default-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero section */}
        <section className="py-16 md:py-24 px-4 md:px-6 relative overflow-hidden">
          <div className="container mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 text-center lg:text-left animate-fade-in-up">
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-default-900">
                  Securely <span className="text-primary">store</span> and
                  manage your <span className="text-primary">images</span>
                </h1>
                <p className="text-lg text-default-600">
                  Clean. Fast. Private. Built for you.
                </p>

                <div className="flex flex-wrap gap-4 pt-6 justify-center lg:justify-start">
                  {!userId && (
                    <>
                      <Link href="/sign-up">
                        <Button className="btn-2">
                          <span>Get Started</span>
                        </Button>
                      </Link>
                      <Link href="/sign-in">
                        <Button className="btn-2 ">
                          <span>Sign In</span>
                        </Button>
                      </Link>
                    </>
                  )}
                  {userId && (
                    <Link href="/dashboard">
                      <Button
                        size="lg"
                        variant="solid"
                        color="primary"
                        endContent={<ArrowRight className="h-4 w-4" />}
                      >
                        Go to Dashboard
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <div className="relative w-80 h-80">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-400/10 to-transparent rounded-full blur-3xl animate-float-glow" />
                  <div className="relative z-10 flex items-center justify-center w-full h-full">
                    <ImageIcon className="h-32 w-32 text-primary/80 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Features section */}
        <section className="py-12 md:py-16 px-4 md:px-6 bg-default-50">
          <div className="container mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-default-900">
                What You Get
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              <Card className="backdrop-blur-sm bg-white/60 dark:bg-black/30 border border-default-200 shadow-md hover:scale-[1.02] transition-transform duration-300">
                <CardBody className="p-6 text-center space-y-2">
                  <CloudUpload className="h-12 w-12 mx-auto text-primary" />
                  <h3 className="text-xl font-semibold text-default-900">
                    Quick Uploads
                  </h3>
                  <p className="text-default-600">Drag, drop, done.</p>
                </CardBody>
              </Card>

              <Card className="backdrop-blur-sm bg-white/60 dark:bg-black/30 border border-default-200 shadow-md hover:scale-[1.02] transition-transform duration-300">
                <CardBody className="p-6 text-center space-y-2">
                  <CloudUpload className="h-12 w-12 mx-auto text-primary" />
                  <h3 className="text-xl font-semibold text-default-900">
                    Smart Organization
                  </h3>
                  <p className="text-default-600">
                    Keep it tidy, find it fast.
                  </p>
                </CardBody>
              </Card>

              <Card className="backdrop-blur-sm bg-white/60 dark:bg-black/30 border border-default-200 shadow-md hover:scale-[1.02] transition-transform duration-300">
                <CardBody className="p-6 text-center space-y-2">
                  <CloudUpload className="h-12 w-12 mx-auto text-primary" />
                  <h3 className="text-xl font-semibold text-default-900">
                    Locked Down
                  </h3>
                  <p className="text-default-600">
                    Your images, your eyes only.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-16 md:py-24 px-4 md:px-6 bg-default-50">
          <div className="container mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-default-900">
              🎉 Ready to get started?
            </h2>
            <p className="text-lg text-default-600">
              Sign up and organize your visual world.
            </p>
            <div className="flex justify-center gap-4 mt-6">
              {!userId && (
                <Link href="/sign-up">
                  <button className="neon-button">Let’s Go</button>
                </Link>
              )}
              {userId && (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="solid"
                    color="primary"
                    endContent={<ArrowRight className="h-4 w-4" />}
                    className="hover:shadow-lg hover:scale-[1.03] transition-transform"
                  >
                    Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Simple footer */}
      <footer className="bg-default-50 border-t border-default-200 py-4 md:py-6">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <CloudUpload className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Droply</h2>
            </div>
            <p className="text-default-500 text-sm">
              &copy; {new Date().getFullYear()} WobbleBox
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
