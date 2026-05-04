import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";

function RegisterPage() {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        try {
            await register(firstName, lastName, email, password);
            navigate("/login");
        } catch {
            setErrorMessage("Registration failed. This email may already be used.");
        }
    }

    return (
        <div>
            <h2>Register</h2>

            {errorMessage && <p>{errorMessage}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>First name</label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                    />
                </div>

                <div>
                    <label>Last name</label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                    />
                </div>

                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </div>

                <div>
                    <label>Confirm password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                    {confirmPassword && (
                        <p style={{ color: password === confirmPassword ? "green" : "red" }}>
                            {password === confirmPassword
                                ? "Passwords match"
                                : "Passwords do not match"}
                        </p>
                    )}
                </div>

                <button type="submit" disabled={password !== confirmPassword}>
                    Register
                </button>
            </form>

            <p>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}

export default RegisterPage;