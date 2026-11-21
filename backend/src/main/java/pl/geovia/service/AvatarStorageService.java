package pl.geovia.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.Locale;
import java.util.UUID;

@Service
public class AvatarStorageService {
    private static final long MAX_BYTES = 2L * 1024 * 1024;
    private static final long MAX_PIXELS = 12_000_000L;
    private final Path root;

    public AvatarStorageService(@Value("${app.storage.avatar-directory:./data/avatars}") String directory) {
        this.root = Path.of(directory).toAbsolutePath().normalize();
    }

    public String store(UUID profileId, MultipartFile file) {
        if (file.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Wybierz plik obrazu.");
        if (file.getSize() > MAX_BYTES) throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Zdjęcie może mieć maksymalnie 2 MB.");
        String extension;
        try (InputStream input = file.getInputStream(); ImageInputStream image = ImageIO.createImageInputStream(input)) {
            if (image == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Plik nie jest prawidłowym obrazem.");
            Iterator<ImageReader> readers = ImageIO.getImageReaders(image);
            if (!readers.hasNext()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Obsługiwane formaty zdjęć to PNG, JPEG i GIF.");
            ImageReader reader = readers.next();
            try {
                reader.setInput(image, true, true);
                int width = reader.getWidth(0), height = reader.getHeight(0);
                if (width < 1 || height < 1 || (long) width * height > MAX_PIXELS)
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Wymiary obrazu są zbyt duże.");
                extension = switch (reader.getFormatName().toLowerCase(Locale.ROOT)) {
                    case "png" -> ".png";
                    case "jpeg", "jpg" -> ".jpg";
                    case "gif" -> ".gif";
                    default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Obsługiwane formaty zdjęć to PNG, JPEG i GIF.");
                };
            } finally { reader.dispose(); }
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nie udało się odczytać pliku obrazu.");
        }

        String key = UUID.randomUUID() + extension;
        Path profileDirectory = profileDirectory(profileId);
        try {
            Files.createDirectories(profileDirectory);
            try (InputStream input = file.getInputStream()) {
                Files.copy(input, profileDirectory.resolve(key));
            }
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Nie udało się zapisać zdjęcia profilowego.");
        }
        return key;
    }

    public AvatarImage load(UUID profileId, String key) {
        Path file = resolve(profileId, key);
        try {
            byte[] bytes = Files.readAllBytes(file);
            String contentType = switch (extension(key)) {
                case ".png" -> "image/png";
                case ".jpg" -> "image/jpeg";
                case ".gif" -> "image/gif";
                default -> throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Zdjęcia nie znaleziono.");
            };
            return new AvatarImage(bytes, contentType);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Zdjęcia nie znaleziono.");
        }
    }

    public void delete(UUID profileId, String key) {
        if (key == null || key.startsWith("data:image/")) return;
        try { Files.deleteIfExists(resolve(profileId, key)); }
        catch (IOException exception) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Nie udało się usunąć zdjęcia profilowego."); }
    }

    public void deleteProfileFiles(UUID profileId) {
        Path directory = profileDirectory(profileId);
        if (!directory.startsWith(root)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid profile storage path");
        if (!Files.exists(directory)) return;
        try (var paths = Files.walk(directory)) {
            for (Path path : paths.sorted(java.util.Comparator.reverseOrder()).toList()) Files.deleteIfExists(path);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Nie udało się usunąć plików profilu.");
        }
    }

    private Path profileDirectory(UUID profileId) { return root.resolve(profileId.toString()).normalize(); }
    private Path resolve(UUID profileId, String key) {
        if (key == null || !key.matches("[0-9a-fA-F-]{36}\\.(png|jpg|gif)"))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Zdjęcia nie znaleziono.");
        Path file = profileDirectory(profileId).resolve(key).normalize();
        if (!file.startsWith(root) || !file.startsWith(profileDirectory(profileId)))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Zdjęcia nie znaleziono.");
        return file;
    }
    private static String extension(String key) { return key.substring(key.lastIndexOf('.')).toLowerCase(Locale.ROOT); }
    public record AvatarImage(byte[] bytes, String contentType) {}
}
