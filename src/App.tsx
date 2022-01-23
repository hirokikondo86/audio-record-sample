import { VFC, useState, useEffect, useCallback } from "react";
import { ref, listAll, uploadBytes, getBlob } from "firebase/storage";
import { useFirebase } from "./hooks/useFirebase";
import { useRecorder } from "./hooks/useRecorder";
import { convertBlobToFile } from "./utils/convertBlobToFile";
import styles from "./App.module.css";

export const App: VFC = () => {
  const { audioBlob, isRecording, startRecording, stopRecording } =
    useRecorder();
  const { firebaseStorage } = useFirebase();
  const [audioURLs, setAudioURLs] = useState<string[]>([]);

  const getAudiosFromStorage = useCallback(async () => {
    if (!firebaseStorage) {
      return;
    }

    const listRef = ref(firebaseStorage, "audios/");
    const listAllResult = await listAll(listRef).catch(console.error);
    if (!listAllResult) {
      return;
    }

    const getBlobResult = await Promise.all(
      listAllResult.items.map((item) =>
        getBlob(ref(firebaseStorage, item.fullPath))
      )
    ).catch(console.error);
    if (!getBlobResult) {
      return;
    }

    return getBlobResult;
  }, [firebaseStorage]);

  useEffect(() => {
    (async () => {
      const getBlobResult = await getAudiosFromStorage();
      if (!getBlobResult) {
        return;
      }

      setAudioURLs(getBlobResult.map((blob) => URL.createObjectURL(blob)));
    })();
  }, [firebaseStorage, getAudiosFromStorage]);

  const handleClick = async () => {
    if (!firebaseStorage || !audioBlob) {
      return;
    }

    const now = new Date().toISOString().replace(/[^0-9]/g, "");
    const audioFile = convertBlobToFile(audioBlob, `${now}.webm`);

    const storageRef = ref(firebaseStorage, `audios/${audioFile.name}`);
    await uploadBytes(storageRef, audioFile).catch(console.error);

    // 追加したデータ分を再取得
    const getBlobResult = await getAudiosFromStorage();
    if (!getBlobResult) {
      return;
    }

    setAudioURLs(getBlobResult.map((blob) => URL.createObjectURL(blob)));
  };

  return (
    <main>
      <header>
        <h1 className={styles.title}>Audio Post Sample</h1>
      </header>
      <section className={styles.recorder}>
        <h2 className={styles.subtitle}>音声を録音する</h2>
        {audioBlob ? (
          <audio src={URL.createObjectURL(audioBlob)} controls />
        ) : (
          <audio controls />
        )}
        <div className={styles.buttonGroup}>
          <button
            className={styles.button}
            onClick={startRecording}
            disabled={isRecording}
          >
            {isRecording ? "録音中..." : "録音開始"}
          </button>
          <button
            className={styles.button}
            onClick={stopRecording}
            disabled={!isRecording}
          >
            録音停止
          </button>
          <button
            className={styles.button}
            onClick={handleClick}
            disabled={!audioBlob}
          >
            保存
          </button>
        </div>
      </section>
      <section>
        <h2 className={styles.subtitle}>投稿一覧</h2>
        {audioURLs.length === 0 ? (
          <p>投稿がありません。</p>
        ) : (
          <ul className={styles.audioList}>
            {audioURLs.map((url) => (
              <li key={url}>
                {/* MEMO: <source> で拡張子によって出し分ける */}
                <audio src={url} controls />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};
