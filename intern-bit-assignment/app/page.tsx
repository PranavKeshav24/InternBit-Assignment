import VideoCall from "@/components/VideoCall";

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Video Call App</h1>
      <VideoCall />
    </div>
  );
}