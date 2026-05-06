import ListingScreen from "@/components/screens/ListingScreen";

export default function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  return <ListingScreen params={params} />;
}
