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
  const { user, updateUser, uploadAvatar, removeAvatar } = useUser();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [visibility, setVisibility] = useState<'private' | 'public'>(user?.visibility ?? 'private');
  const [saved, setSaved] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [saveError, setSaveError] = useState('');

  if (!user) return <Navigate to="/login" replace />;

  async function onAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/gif'].includes(file.type)) {
      window.alert("Wybierz obraz PNG, JPEG lub GIF.");
      event.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      window.alert("Wybierz zdjęcie o rozmiarze do 2 MB.");
      event.target.value = "";
      return;
    }

    setAvatarBusy(true); setAvatarError('');
    try { await uploadAvatar(file); setSaved(false); }
    catch (error) { setAvatarError(error instanceof Error ? error.message : 'Nie udało się zapisać zdjęcia.'); }
    finally { setAvatarBusy(false); event.target.value = ""; }
  }

  async function removeCurrentAvatar() {
    setAvatarBusy(true); setAvatarError('');
    try { await removeAvatar(); setSaved(false); }
    catch (error) { setAvatarError(error instanceof Error ? error.message : 'Nie udało się usunąć zdjęcia.'); }
    finally { setAvatarBusy(false); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError('');
    try {
      await updateUser({ username: username.trim(), bio: bio.trim(), city: city.trim(), visibility });
      setSaved(true);
      navigate("/profile");
    } catch (error) {
      setSaved(false);
      setSaveError(error instanceof Error ? error.message : 'Nie udało się zapisać profilu.');
    }
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
                disabled={avatarBusy}
              >
                <Camera size={16} /> {user.avatar ? "Zmień zdjęcie" : "Dodaj zdjęcie"}
              </button>
              {user.avatar && (
                <button
                  type="button"
                  className="text-danger-button"
                  onClick={() => void removeCurrentAvatar()}
                  disabled={avatarBusy}
                >
                  <ImageOff size={15} /> Usuń zdjęcie
                </button>
              )}
            </div>
            <input
              ref={fileInput}
              className="visually-hidden"
              type="file"
              accept="image/png,image/jpeg,image/gif"
              onChange={onAvatarChange}
              disabled={avatarBusy}
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

          <label>
            Widoczność profilu
            <select value={visibility} onChange={event => { setVisibility(event.target.value as 'private' | 'public'); setSaved(false); }}>
              <option value="private">Prywatny</option>
              <option value="public">Publiczny</option>
            </select>
            <span className="field-help">{visibility === 'public' ? 'Profil będzie widoczny pod publicznym linkiem i pokaże nazwę, avatar, opis oraz miasto.' : 'Profil jest dostępny tylko po zalogowaniu na to konto.'}</span>
            {visibility === 'public' && visibility === user.visibility && username.trim() === user.username
              ? <Link className="profile-preview-link" to={`/u/${encodeURIComponent(user.username)}`} target="_blank" rel="noreferrer">Otwórz publiczny podgląd profilu</Link>
              : visibility === 'public' && <span className="field-help">Zapisz profil, aby włączyć publiczny podgląd.</span>}
          </label>

          <div className="account-info-note">
            <strong>Twój profil</strong>
            <p>Zmiany profilu są zapisywane na koncie. Zdjęcie jest przesyłane jako osobny plik i nie jest kodowane w bazie danych.</p>
          </div>
          {avatarError && <p className="form-error" role="alert">{avatarError}</p>}
          {saveError && <p className="form-error" role="alert">{saveError}</p>}

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
