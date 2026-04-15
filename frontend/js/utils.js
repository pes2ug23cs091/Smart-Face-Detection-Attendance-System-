const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const getApiBase = () => localStorage.getItem("apiBase") || "http://127.0.0.1:8080";
const setApiBase = (value) => localStorage.setItem("apiBase", value);

const toast = (message, type = "success") => {
	const el = document.createElement("div");
	el.className = `toast ${type}`;
	el.textContent = message;
	document.body.appendChild(el);
	setTimeout(() => el.remove(), 3000);
};

const formatDate = (date) => new Date(date).toISOString().slice(0, 10);
const formatTime = (date) => new Date(date).toTimeString().slice(0, 8);

window.Utils = { $, $$, getApiBase, setApiBase, toast, formatDate, formatTime };
