// Collaboration panel: shows active members, roles, invite form, node assignment
import { useState, useEffect } from 'react';
import { Users, UserPlus, Crown, Eye, Pencil } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import {API_BASE} from '../../lib/apiClient';

const ROLE_ICONS = {
    owner: <Crown className="w-4 h-4 text-yellow-400" />,
    editor: <Pencil className="w-4 h-4 text-white/60" />,
    viewer: <Eye className="w-4 h-4 text-white/50" />,
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
                `${API_BASE}/api/collab/${roadmapId}`,
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
                `${API_BASE}/api/collab/invite`,
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
        <div className="w-72 bg-black/95 border-l border-white/10 p-6 flex flex-col gap-6 h-full overflow-y-auto">
            <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-white" />
                <h3 className="text-white font-semibold">Collaborators</h3>
            </div>

            {/* Collaborator list */}
            <div className="space-y-4">
                {collaborators.map((c) => (
                    <div key={c.users.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                            {c.users.avatar_url ? (
                                <img src={c.users.avatar_url} alt={c.users.display_name} />
                            ) : (
                                c.users.display_name?.[0] || c.users.email[0].toUpperCase()
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{c.users.display_name || c.users.email.split('@')[0]}</p>
                            <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">{c.role}</p>
                        </div>
                        {ROLE_ICONS[c.role]}
                    </div>
                ))}
            </div>

            {/* Invite form — only visible to owner */}
            {isOwner && (
                <div className="space-y-3 pt-6 border-t border-white/10 mt-auto">
                    <p className="text-xs text-white/50 font-bold uppercase tracking-widest flex items-center gap-2">
                        <UserPlus size={14} /> Invite teammate
                    </p>
                    <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="teammate@email.com"
                        className="w-full px-3 py-2.5 text-sm bg-black/90 text-white rounded-xl border border-white/10 focus:border-white/20 outline-none placeholder:text-white/30"
                    />
                    <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm bg-black/90 text-white rounded-xl border border-white/10 focus:border-white/20 outline-none"
                    >
                        <option value="editor">Editor — can take quizzes</option>
                        <option value="viewer">Viewer — read-only</option>
                    </select>
                    {error && <p className="text-white/80 text-[10px] bg-white/5 p-2 rounded-lg">{error}</p>}
                    <button
                        onClick={handleInvite}
                        disabled={inviting}
                        className="w-full py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all"
                    >
                        {inviting ? 'Inviting...' : 'Send Invite'}
                    </button>
                </div>
            )}
        </div>
    );
}