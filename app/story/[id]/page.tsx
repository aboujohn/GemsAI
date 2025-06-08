type StoryPageParams = {
  id: string;
};

export default async function Page({ params }: { params: Promise<StoryPageParams> }) {
  const resolvedParams = await params;
  
  return (
    <div>
      <h1>Story Details</h1>
      <p>ID: {resolvedParams.id}</p>
    </div>
  );
}
