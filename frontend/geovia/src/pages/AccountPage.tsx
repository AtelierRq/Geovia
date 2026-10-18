import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeft, Camera, LogOut, Save, UserRound } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "../styles/profile.css";

function AccountPage() {
  const { user, updateUser, signOut } = useUser();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saved, setSaved] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  function onAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) {
      window.alert("Wybierz zdjęcie o rozmiarze do 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () =>
      updateUser({
        avatar: String(reader.result),
      });
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateUser({
      username: username.trim(),
      email: email.trim(),
    });
    setSaved(true);
  }

  function logout() {
    signOut();
    navigate("/");
  }

  return (
    <main className="profile-page account-page">
      <div className="account-back-row">
        <Link to="/profile">
          <ArrowLeft size={17} /> Wróć do profilu
        </Link>
      </div>
      <section className="profile-heading">
        <div>
          <span className="eyebrow">USTAWIENIA</span>
          <h1>Dane konta</h1>
          <p>Zarządzaj informacjami i zdjęciem profilowym.</p>
        </div>
      </section>
      <section className="account-card">
        <div className="account-avatar-section">
          <div className="profile-avatar account-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt="Zdjęcie profilowe" />
            ) : (
              <UserRound size={36} />
            )}
          </div>
          <div>
            <h2>Zdjęcie profilowe</h2>
            <p>Wybierz zdjęcie JPG, PNG lub inny format obrazu (maks. 2 MB).</p>
            <button
              type="button"
              className="secondary-button"
              onClick={() => fileInput.current?.click()}
            >
              <Camera size={16} />{" "}
              {user.avatar ? "Zmień zdjęcie" : "Dodaj zdjęcie"}
            </button>
            <input
              ref={fileInput}
              className="visually-hidden"
              type="file"
              accept="image/*"
              onChange={onAvatarChange}
            />
          </div>
        </div>
        <form className="account-form" onSubmit={save}>
          <label>
            Nazwa użytkownika
            <input
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setSaved(false);
              }}
              required
              minLength={2}
              maxLength={30}
            />
          </label>
          <label>
            Adres e-mail
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setSaved(false);
              }}
              required
            />
          </label>
          <div className="account-info-note">
            <strong>Bezpieczeństwo konta</strong>
            <p>
              To na razie demonstracyjne ustawienia przechowywane w pamięci tej
              przeglądarki. Hasło, weryfikację e-mail i prawdziwe zarządzanie
              kontem dodamy razem z backendem.
            </p>
          </div>
          <div className="account-form-actions">
            <button className="primary-button" type="submit">
              <Save size={16} /> Zapisz zmiany
            </button>
            {saved && (
              <span className="account-saved-message">Zmiany zapisane.</span>
            )}
          </div>
        </form>
      </section>
      <button className="account-logout-button" type="button" onClick={logout}>
        <LogOut size={17} /> Wyloguj z trybu demonstracyjnego
      </button>
    </main>
  );
}
export default AccountPage;
