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
				maxWidth: 900,
				margin: "3rem auto",
				padding: 32,
				border: "1.5px solid #e0e0e0",
				borderRadius: 14,
				background: "#fff",
				boxShadow: "0 2px 16px 0 #e0e0e0a0",
				display: "flex",
				gap: 32,
				alignItems: "flex-start",
				flexWrap: "wrap",
			}}
		>
			<div style={{ flex: 1, minWidth: 320 }}>
				<h2
					style={{
						textAlign: "center",
						marginBottom: 28,
						color: "#2d3a4a",
					}}
				>
					Select Dummy Attendance
				</h2>
				<div style={{ marginBottom: 28 }}>
					{dummyList.map((item, idx) => (
						<label
							key={idx}
							style={{
								display: "flex",
								alignItems: "center",
								marginBottom: 12,
								padding: 10,
								borderRadius: 8,
								background:
									selectedIdx === idx ? "#f0f6ff" : "#f8f8f8",
								border:
									selectedIdx === idx
										? "2px solid #1976d2"
										: "1px solid #e0e0e0",
								cursor: "pointer",
								transition:
									"background 0.2s, border 0.2s",
							}}
						>
							<input
								type="radio"
								name="dummy"
								checked={selectedIdx === idx}
								onChange={() => handleRadioChange(idx)}
								style={{
									marginRight: 14,
									accentColor: "#1976d2",
									width: 18,
									height: 18,
								}}
							/>
							<div>
								<div
									style={{
										fontWeight: 600,
										fontSize: 17,
									}}
								>
									{item.subject}{" "}
									<span
										style={{
											color: "#1976d2",
											fontWeight: 400,
										}}
									>
										({item.lectureType})
									</span>
								</div>
								<div
									style={{
										fontSize: 14,
										color: "#555",
									}}
								>
									{item.teacher}
								</div>
								<div
									style={{
										fontSize: 13,
										color: "#888",
									}}
								>
									{item.lectureTime} &middot; {item.date} &middot;{" "}
									{item.status}
								</div>
							</div>
						</label>
					))}
				</div>
				<button
					onClick={pushDummy}
					disabled={loading}
					style={{
						padding: "0.7rem 2.2rem",
						fontSize: 19,
						background: loading ? "#b3d2f7" : "#1976d2",
						color: "#fff",
						border: "none",
						borderRadius: 7,
						fontWeight: 600,
						cursor: loading ? "not-allowed" : "pointer",
						boxShadow: loading
							? "none"
							: "0 2px 8px #1976d220",
						transition:
							"background 0.2s, box-shadow 0.2s",
						width: "100%",
					}}
				>
					{loading ? "Pushing..." : "Push Selected Dummy"}
				</button>
				{result && (
					<p
						style={{
							marginTop: 18,
							color: result.includes("pushed")
								? "#388e3c"
								: "#d32f2f",
							fontWeight: 500,
							textAlign: "center",
						}}
					>
						{result}
					</p>
				)}
			</div>
			<div style={{ flex: 1, minWidth: 320 }}>
				{lastPushed && (
					<div
						style={{
							marginTop: 0,
							background: "#f5faff",
							padding: 24,
							borderRadius: 10,
							border: "1.5px solid #b3d2f7",
							boxShadow: "0 1px 6px #b3d2f720",
						}}
					>
						<h4
							style={{
								margin: 0,
								marginBottom: 12,
								color: "#1976d2",
								fontWeight: 700,
								fontSize: 18,
							}}
						>
							Selected Attendance
						</h4>
						<div
							style={{
								fontSize: 16,
								marginBottom: 4,
							}}
						>
							<b>Subject:</b> {lastPushed.subject}
						</div>
						<div
							style={{
								fontSize: 16,
								marginBottom: 4,
							}}
						>
							<b>Lecture Type:</b> {lastPushed.lectureType}
						</div>
						<div
							style={{
								fontSize: 16,
								marginBottom: 4,
							}}
						>
							<b>Teacher:</b> {lastPushed.teacher}
						</div>
						<div
							style={{
								fontSize: 16,
								marginBottom: 4,
							}}
						>
							<b>Lecture Time:</b> {lastPushed.lectureTime}
						</div>
						<div
							style={{
								fontSize: 16,
								marginBottom: 4,
							}}
						>
							<b>Date:</b> {lastPushed.date}
						</div>
						<div
							style={{
								fontSize: 16,
							}}
						>
							<b>Status:</b> {lastPushed.status}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
