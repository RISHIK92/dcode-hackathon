import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Documentation
          </h1>
          <p className="text-lg text-muted-foreground">
            Learn how RNLive works and what you can build with it
          </p>
        </div>

        <div className="space-y-6">
          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>
                Understanding the RNLive playground architecture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Code Editor</AccordionTrigger>
                  <AccordionContent>
                    RNLive uses Monaco Editor (the same editor that powers VS Code) to provide
                    a powerful code editing experience with syntax highlighting, auto-completion,
                    and real-time error detection for React Native code.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Live Preview</AccordionTrigger>
                  <AccordionContent>
                    The preview panel renders your React Native code using React Native Web,
                    which translates React Native components into web-compatible equivalents.
                    Changes are compiled and displayed in real-time within a phone emulator frame.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Instant Compilation</AccordionTrigger>
                  <AccordionContent>
                    Your code is transpiled using Babel in the browser, allowing for instant
                    feedback without any server-side processing. This makes RNLive fast and
                    responsive, perfect for quick prototyping and learning.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Limitations */}
          <Card>
            <CardHeader>
              <CardTitle>Limitations in Hackathon Demo</CardTitle>
              <CardDescription>
                Current constraints and what's coming next
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong className="text-foreground">Limited Component Library:</strong> Only basic
                  React Native components (View, Text, StyleSheet, TouchableOpacity, ScrollView)
                  are currently supported.
                </li>
                <li>
                  <strong className="text-foreground">No External Packages:</strong> You cannot
                  import third-party npm packages in this demo version.
                </li>
                <li>
                  <strong className="text-foreground">Single File:</strong> The playground currently
                  supports only a single App.js file without module imports.
                </li>
                <li>
                  <strong className="text-foreground">Basic Error Handling:</strong> Error messages
                  may not be as detailed as in a full development environment.
                </li>
                <li>
                  <strong className="text-foreground">No Native APIs:</strong> Device-specific APIs
                  (Camera, GPS, etc.) are not available in the web environment.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Future Vision */}
          <Card>
            <CardHeader>
              <CardTitle>Future Vision</CardTitle>
              <CardDescription>
                What we're planning to build next
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">📦 Package Manager</h3>
                  <p className="text-sm text-muted-foreground">
                    Import and use popular React Native libraries directly in the playground,
                    including UI libraries, state management tools, and utility packages.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">📁 Multi-File Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Create complex applications with multiple components organized in separate
                    files, just like a real React Native project.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">🔄 Project Sharing</h3>
                  <p className="text-sm text-muted-foreground">
                    Save your projects and share them with others via unique URLs. Collaborate
                    and learn from community examples.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">📱 Device Preview Options</h3>
                  <p className="text-sm text-muted-foreground">
                    Switch between different device sizes and orientations to test responsive
                    layouts. Preview iOS and Android styling differences.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">🚀 Export to Expo</h3>
                  <p className="text-sm text-muted-foreground">
                    Export your playground project as an Expo Snack or download as a full
                    React Native project ready for development.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}