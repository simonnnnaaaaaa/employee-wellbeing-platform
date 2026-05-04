import Header from "../components/Header";
import { useEffect, useState } from "react";
import { createCheckIn, getMyCheckIns } from "../services/checkInService";


type CheckIn = {
    id: string;
    stressLevel: number;
    energyLevel: number;
    mood: string;
    notes?: string;
    createdAt: string;
};

function DashboardPage() {
    const [stressLevel, setStressLevel] = useState(5);
    const [energyLevel, setEnergyLevel] = useState(5);
    const [mood, setMood] = useState("Neutral");
    const [notes, setNotes] = useState("");

    const [message, setMessage] = useState("");

    const [checkIns, setCheckIns] = useState<CheckIn[]>([]);

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        try {
            await createCheckIn({
                stressLevel,
                energyLevel,
                mood,
                notes,
            });

            await loadCheckIns();

            setMessage("Check-in saved successfully.");
            setStressLevel(5);
            setEnergyLevel(5);
            setMood("Neutral");
            setNotes("");
        } catch {
            setMessage("Could not save check-in.");
        }
    }

    async function loadCheckIns() {
        const data = await getMyCheckIns();
        setCheckIns(data);
    }

    useEffect(() => {
        loadCheckIns();
    }, []);

    return (
        <div>
            <Header />

            <h2>Dashboard</h2>
            <p>You are logged in.</p>

            <h3>Daily check-in</h3>

            {message && <p>{message}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Stress level: {stressLevel}</label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={stressLevel}
                        onChange={(event) => setStressLevel(Number(event.target.value))}
                    />
                </div>

                <div>
                    <label>Energy level: {energyLevel}</label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={energyLevel}
                        onChange={(event) => setEnergyLevel(Number(event.target.value))}
                    />
                </div>

                <div>
                    <label>Mood</label>
                    <select
                        value={mood}
                        onChange={(event) => setMood(event.target.value)}
                    >
                        <option value="Happy">Happy</option>
                        <option value="Neutral">Neutral</option>
                        <option value="Tired">Tired</option>
                        <option value="Stressed">Stressed</option>
                        <option value="Anxious">Anxious</option>
                    </select>
                </div>

                <div>
                    <label>Notes</label>
                    <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                    />
                </div>

                <button type="submit">Save check-in</button>
            </form>

            <h3>My previous check-ins</h3>

            {checkIns.length === 0 ? (
                <p>No check-ins yet.</p>
            ) : (
                <ul>
                    {checkIns.map((checkIn) => (
                        <li key={checkIn.id}>
                            <strong>{new Date(checkIn.createdAt).toLocaleString()}</strong>
                            <br />
                            Stress: {checkIn.stressLevel} | Energy: {checkIn.energyLevel} | Mood:{" "}
                            {checkIn.mood}
                            {checkIn.notes && (
                                <>
                                    <br />
                                    Notes: {checkIn.notes}
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}


        </div>
    );
}

export default DashboardPage;