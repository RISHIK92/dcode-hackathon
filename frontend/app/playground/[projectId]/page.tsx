import PlaygroundEditor from "@/components/PlaygroundEditor";

interface PlaygroundPageProps {
  params: {
    projectId: string;
  };
}

export default function PlaygroundPage({ params }: PlaygroundPageProps) {
  const { projectId } = params;

  return <PlaygroundEditor projectId={projectId} />;
}
