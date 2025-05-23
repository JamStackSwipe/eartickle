import { useUser } from '../components/AuthProvider';

const ProfileScreen = () => {
  const { user } = useUser();

  if (!user) return <div className="p-4 text-white">Loading...</div>;

  return (
    <div className="min-h-screen p-6 bg-black text-white">
      <h1 className="text-2xl font-bold mb-6">👤 Your Account</h1>

      <div className="bg-gray-900 p-4 rounded shadow text-sm">
        <p className="mb-2">
          <span className="font-semibold">Email:</span> {user.email}
        </p>
        <p className="mb-2">
          <span className="font-semibold">User ID:</span> {user.id}
        </p>
        <p className="text-gray-400 mt-4">
          This is your unique EarTickle ID. Keep it handy if you ever need support.
        </p>
      </div>
    </div>
  );
};

export default ProfileScreen;
