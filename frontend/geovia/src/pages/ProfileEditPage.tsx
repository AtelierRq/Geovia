import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowLeft,
  Camera,
  ImageOff,
  MapPin,
  Save,
  UserRound,
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "../styles/profile.css";

function ProfileEditPage() {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [saved, setSaved] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  function onAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      window.alert("Wybierz plik obrazu.");
      event.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      window.alert("Wybierz zdjęcie o rozmiarze do 2 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateUser({ avatar: String(reader.result) });
      setSaved(false);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function removeAvatar() {
    updateUser({ avatar: null });
    setSaved(false);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateUser({
      username: username.trim(),
      bio: bio.trim(),
      city: city.trim(),
    });
    setSaved(true);
    navigate("/profile");
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
          <span className="eyebrow">TWÓJ PROFIL</span>
          <h1>Edytuj profil</h1>
          <p>Zarządzaj informacjami, które opisują Ciebie i Twoje zainteresowania.</p>
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
          <div className="avatar-edit-copy">
            <h2>Zdjęcie profilowe</h2>
            <p>Wybierz obraz o rozmiarze do 2 MB.</p>
            <div className="avatar-edit-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => fileInput.current?.click()}
              >
                <Camera size={16} /> {user.avatar ? "Zmień zdjęcie" : "Dodaj zdjęcie"}
              </button>
              {user.avatar && (
                <button
                  type="button"
                  className="text-danger-button"
                  onClick={removeAvatar}
                >
                  <ImageOff size={15} /> Usuń zdjęcie
                </button>
              )}
            </div>
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
            <span className="field-help">Od 2 do 30 znaków.</span>
          </label>

          <label>
            O mnie
            <textarea
              value={bio}
              onChange={(event) => {
                setBio(event.target.value);
                setSaved(false);
              }}
              maxLength={300}
              rows={4}
              placeholder="Napisz kilka słów o sobie, swoich zainteresowaniach lub celach."
            />
            <span className="field-help">{bio.length}/300 znaków</span>
          </label>

          <label>
            <span className="label-with-icon"><MapPin size={15} /> Miasto</span>
            <input
              value={city}
              onChange={(event) => {
                setCity(event.target.value);
                setSaved(false);
              }}
              maxLength={80}
              placeholder="Np. Kraków"
            />
          </label>

          <div className="account-info-note">
            <strong>Profil demonstracyjny</strong>
            <p>Zmiany są zapisywane lokalnie w tej przeglądarce. Po wdrożeniu kont użytkowników będzie można zdecydować, które informacje są widoczne publicznie.</p>
          </div>

          <div className="account-form-actions">
            <button className="primary-button" type="submit">
              <Save size={16} /> Zapisz profil
            </button>
            {saved && <span className="account-saved-message">Zmiany zapisane.</span>}
          </div>
        </form>
      </section>
    </main>
  );
}

export default ProfileEditPage;
