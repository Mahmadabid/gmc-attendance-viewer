"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const dummyList = [
  {
    subject: "Mathematics",
    lectureType: "Lecture",
    teacher: "Dr. Dummy",
    lectureTime: "10:00 AM",
    date: "2025-05-17",
    status: "Present",
  },
  {
    subject: "Physics",
    lectureType: "Lab",
    teacher: "Prof. Example",
    lectureTime: "12:00 PM",
    date: "2025-05-16",
    status: "Absent",
  },
  {
    subject: "Chemistry",
    lectureType: "Lecture",
    teacher: "Dr. Chem",
    lectureTime: "2:00 PM",
    date: "2025-05-15",
    status: "Present",
  },
  {
    subject: "Biology",
    lectureType: "Lab",
    teacher: "Prof. Bio",
    lectureTime: "3:00 PM",
    date: "2025-05-14",
    status: "Absent",
  },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DummyPushPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [lastPushed, setLastPushed] = useState<any | null>(null);

  useEffect(() => {
    // On mount, show the selected dummy (default 0)
    setLastPushed(dummyList[selectedIdx]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRadioChange = (idx: number) => {
    setSelectedIdx(idx);
    setLastPushed(dummyList[idx]);
    setResult(null);
  };

  const pushDummy = async () => {
    setLoading(true);
    setResult(null);
    const selected = dummyList[selectedIdx];
    // Map camelCase to snake_case for Supabase
    const dummy = {
      subject: selected.subject,
      lecturetype: selected.lectureType,
      teacher: selected.teacher,
      lecturetime: selected.lectureTime,
      date: selected.date,
      status: selected.status,
    };
    const { error } = await supabase.from("dummy_attendance").insert([dummy]);
    setResult(!error ? "Dummy attendance pushed!" : error.message || "Failed");
    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "2rem auto",
        padding: 24,
        border: "1px solid #ccc",
        borderRadius: 8,
      }}
    >
      <h2>Push Dummy Attendance</h2>
      <div style={{ marginBottom: 20 }}>
        {dummyList.map((item, idx) => (
          <label
            key={idx}
            style={{
              display: "block",
              marginBottom: 6,
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="dummy"
              checked={selectedIdx === idx}
              onChange={() => handleRadioChange(idx)}
              style={{ marginRight: 8 }}
            />
            {item.subject} ({item.lectureType}) - {item.teacher}
          </label>
        ))}
      </div>
      <button
        onClick={pushDummy}
        disabled={loading}
        style={{ padding: "0.5rem 1.5rem", fontSize: 18 }}
      >
        {loading ? "Pushing..." : "Push Selected Dummy"}
      </button>
      {result && <p style={{ marginTop: 16 }}>{result}</p>}
      {lastPushed && (
        <div
          style={{
            marginTop: 24,
            background: "#f9f9f9",
            padding: 12,
            borderRadius: 6,
          }}
        >
          <h4 style={{ margin: 0, marginBottom: 8 }}>Selected Attendance</h4>
          <div>
            <b>Subject:</b> {lastPushed.subject}
          </div>
          <div>
            <b>Lecture Type:</b> {lastPushed.lectureType}
          </div>
          <div>
            <b>Teacher:</b> {lastPushed.teacher}
          </div>
          <div>
            <b>Lecture Time:</b> {lastPushed.lectureTime}
          </div>
          <div>
            <b>Date:</b> {lastPushed.date}
          </div>
          <div>
            <b>Status:</b> {lastPushed.status}
          </div>
        </div>
      )}
    </div>
  );
}
