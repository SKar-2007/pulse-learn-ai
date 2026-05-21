// Collaboration panel: shows active members, roles, invite form, node assignment
import { useState, useEffect } from 'react';
import { Users, UserPlus, Crown, Eye, Pencil } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

const ROLE_ICONS = {
    owner: <Crown className="w-4 h-4 text-yellow-400" />,
    editor: <Pencil className="w-4 h-4 text-indigo-400" />,
    viewer: <Eye className="w-4 h-4 text-gray-400" />,
};

export default function CollabSidebar({ roadmapId, ownerId }) {
    const { session, user } = useAuth();
    const [collaborators, setCollaborators] = useState([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('editor');
    const [inviting, setInviting] = useState(false);
    const [error, setError] = useState(null);

    const isOwner = user?.id === ownerId;

    const fetchCollaborators = async () => {
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/collab/${roadmapId}`,
                { headers: { Authorization: `Bearer ${session.access_token}` } }
            );
            setCollaborators(data.collaborators || []);
        } catch (err) {
            console.error('Failed to fetch collaborators:', err);
        }
    };

    useEffect(() => {
        if (roadmapId && session?.access_token) {
            fetchCollaborators();
        }
    }, [roadmapId, session]);

    const handleInvite = async () => {
        if (!inviteEmail.trim()) return;
        setInviting(true);
        setError(null);
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/collab/invite`,
                { roadmap_id: roadmapId, invitee_email: inviteEmail, role: inviteRole },
                { headers: { Authorization: `Bearer ${session.access_token}` } }
            );
            setInviteEmail('');
            fetchCollaborators();
        } catch (err) {
            setError(err.response?.data?.error || 'Invite failed');
        } finally {
            setInviting(false);
        }
    };

    return (
        <div className="w-72 bg-gray-900 border-l border-gray-800 p-6 flex flex-col gap-6 h-full overflow-y-auto">
            <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="text-white font-semibold">Collaborators</h3>
            </div>

            {/* Collaborator list */}
            <div className="space-y-4">
                {collaborators.map((c) => (
                    <div key={c.users.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                            {c.users.avatar_url ? (
                                <img src={c.users.avatar_url} alt={c.users.display_name} />
                            ) : (
                                c.users.display_name?.[0] || c.users.email[0].toUpperCase()
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{c.users.display_name || c.users.email.split('@')[0]}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{c.role}</p>
                        </div>
                        {ROLE_ICONS[c.role]}
                    </div>
                ))}
            </div>

            {/* Invite form — only visible to owner */}
            {isOwner && (
                <div className="space-y-3 pt-6 border-t border-gray-800 mt-auto">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <UserPlus size={14} /> Invite teammate
                    </p>
                    <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="teammate@email.com"
                        className="w-full px-3 py-2.5 text-sm bg-gray-800 text-white rounded-xl border border-gray-700 
              focus:border-indigo-500 outline-none placeholder:text-gray-600"
                    />
                    <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm bg-gray-800 text-white rounded-xl border border-gray-700 
              focus:border-indigo-500 outline-none"
                    >
                        <option value="editor">Editor — can take quizzes</option>
                        <option value="viewer">Viewer — read-only</option>
                    </select>
                    {error && <p className="text-red-400 text-[10px] bg-red-400/10 p-2 rounded-lg">{error}</p>}
                    <button
                        onClick={handleInvite}
                        disabled={inviting}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 
              text-white text-sm font-bold rounded-xl transition-all"
                    >
                        {inviting ? 'Inviting...' : 'Send Invite'}
                    </button>
                </div>
            )}
        </div>
    );
}
