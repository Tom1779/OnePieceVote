import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const RankingsPage = () => {
  // Mock data - replace with your actual data
  const characters = [
    {
      id: 1,
      name: "Monkey D. Luffy",
      image_url: "/api/placeholder/100/100",
      votes: 1500,
    },
    {
      id: 2,
      name: "Roronoa Zoro",
      image_url: "/api/placeholder/100/100",
      votes: 1200,
    },
    // ... more characters
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Voting
            </Link>
            <div className="text-xl font-bold text-blue-600">
              Character Rankings
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="grid grid-cols-[auto,1fr,auto] gap-4 p-4 border-b bg-gray-50 font-semibold">
            <div className="w-16 text-center">Rank</div>
            <div>Character</div>
            <div className="w-24 text-center">Votes</div>
          </div>

          <div className="divide-y">
            {characters.map((character, index) => (
              <div
                key={character.id}
                className="grid grid-cols-[auto,1fr,auto] gap-4 p-4 items-center hover:bg-gray-50"
              >
                <div className="w-16 text-center font-bold text-gray-500">
                  #{index + 1}
                </div>
                <div className="flex items-center gap-4">
                  <img
                    src={character.image_url}
                    alt={character.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="font-medium">{character.name}</div>
                </div>
                <div className="w-24 text-center text-gray-600">
                  {character.votes}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RankingsPage;
