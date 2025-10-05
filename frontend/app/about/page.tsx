import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Twitter, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            About Nativex
          </h1>
          <p className="text-lg text-muted-foreground">
            Built with passion during the Orchid UI Hackathon
          </p>
        </div>

        {/* Project Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>The Project</CardTitle>
            <CardDescription>
              A modern React Native playground for the web
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Nativex is an in-browser React Native playground that lets you write, edit, and
              preview React Native code instantly. Inspired by tools like Expo Snack and
              CodeSandbox, Nativex aims to make learning and prototyping React Native applications
              accessible to everyone.
            </p>
            <p className="text-sm text-muted-foreground">
              Built during the Orchid UI Hackathon, this project showcases the power of modern
              web technologies including Next.js 15, Monaco Editor, React Native Web, and the
              beautiful Orchid UI component library.
            </p>
            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold text-foreground mb-3">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {["Next.js 15", "React 18", "TypeScript", "Orchid UI", "Tailwind CSS", "Monaco Editor", "React Native Web"].map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team */}
        <Card>
          <CardHeader>
            <CardTitle>The Team</CardTitle>
            <CardDescription>
              Meet the developers behind Nativex
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Team Member 1 */}
              <div className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                    D
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Developer One</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Full-stack Developer
                    </p>
                    <div className="flex gap-3">
                      <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                        <Github className="w-4 h-4" />
                      </a>
                      <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                        <Twitter className="w-4 h-4" />
                      </a>
                      <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                        <Globe className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Member 2 */}
              <div className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                    D
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Developer Two</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      UI/UX Designer & Developer
                    </p>
                    <div className="flex gap-3">
                      <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                        <Github className="w-4 h-4" />
                      </a>
                      <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                        <Twitter className="w-4 h-4" />
                      </a>
                      <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                        <Globe className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Special thanks to the Orchid UI team for creating an amazing component library
                and hosting this hackathon! 🎉
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}