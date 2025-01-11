const text = "A playlist for every mood".split(" ");

const container = document.getElementById('text-container');

for (let i = 0; i < text.length; i++) {
    const div = document.createElement("div");
    div.classList.add("container");

    const span = document.createElement("span");
    span.innerText = text[i];
    span.classList.add("rising-text");
    span.style.animationDelay = `${i * 200}ms`;

    div.appendChild(span);
    container.appendChild(div);
}