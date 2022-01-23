import { useCallback, useEffect, useState } from "react";
import fixWebmDuration from "fix-webm-duration";

export const useRecorder = () => {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    // レコーダーの初回入手の際に実行される
    if (recorder === null) {
      if (isRecording) {
        requestRecorder().then(setRecorder, console.error);
      }
      return;
    }

    if (isRecording) {
      recorder.start();
    } else {
      recorder.stop();
    }

    // データを含む Blob オブジェクトが使用可能になった (記録が完了して Blob オブジェクトに変換された) 際に音声を取得する
    const handleData = async (e: BlobEvent) => {
      // MEMO: Chrome では WebM に duration メタデータが付与されない
      const fixedBlob = await fixWebmDuration(e.data, Date.now() - startTime, {
        logger: false,
      });
      setAudioBlob(fixedBlob);
    };

    recorder.addEventListener("dataavailable", handleData);
    return () => recorder.removeEventListener("dataavailable", handleData);
  }, [recorder, isRecording, startTime]);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setStartTime(Date.now());
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  return { audioBlob, isRecording, startRecording, stopRecording };
};

const requestRecorder = async () => {
  // メディア(WebカメラやWebマイク)のストリームを取得
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  // メディアを記録するための機能を提供するインスタンスを生成
  return new MediaRecorder(stream);
};

// const getExtension = (audioType: string) => {
//   let extension = "webm";
//   const matches = audioType.match(/audio\/([^;]+)/);
//   if (matches) {
//     extension = matches[1];
//   }

//   return extension;
// };
