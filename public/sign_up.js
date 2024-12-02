document.getElementById("signupForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // 기본 폼 제출 동작 방지

    // 입력 값 가져오기
    const fullname = document.getElementById("fullname").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // 비밀번호 확인
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    // 데이터 전송
    try {
        const response = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ fullname, email, password }),
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message); // 성공 메시지
        } else {
            alert(`Error: ${result.error}`); // 오류 메시지
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An unexpected error occurred!");
    }
});
