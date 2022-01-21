const TEXT = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam vehicula condimentum vehicula. Sed tristique interdum mollis. Nulla rhoncus eu nibh et convallis. Vivamus commodo ornare ornare. Integer vel suscipit arcu, sed tristique arcu. Duis iaculis justo lacus, non finibus diam molestie ut. Ut a consectetur urna, sit amet suscipit purus. Duis vitae enim massa. Mauris quis magna ac quam lacinia ultricies a non dui. Etiam ultrices, felis ac faucibus cursus, nisi felis maximus elit, vitae faucibus massa sapien vitae sapien. In blandit viverra mauris, sit amet pretium nisi vulputate at. Etiam viverra eros vel turpis vehicula auctor a sed nulla. Nam ac eleifend justo, ac sollicitudin massa. Suspendisse porttitor nisi velit, a interdum ligula dignissim quis.

Phasellus turpis diam, vulputate ac porttitor nec, mattis at quam. Quisque blandit vestibulum risus quis sodales. Vivamus vulputate vitae odio vitae aliquam. In rhoncus ornare ex, sit amet semper dolor. Aenean dignissim et purus ut ultricies. Fusce volutpat tortor nibh, vel malesuada lacus vulputate vitae. Quisque non ullamcorper quam.

Aliquam rutrum orci nec urna auctor, eget bibendum felis rutrum. Suspendisse bibendum convallis pretium. Nam condimentum tincidunt nisi, et rhoncus erat aliquet at. Phasellus a felis sed ligula tempus rutrum. Vestibulum rutrum, metus ut faucibus laoreet, ante ipsum ultrices sem, ac egestas risus arcu a sem. Duis sapien nisl, tempor ac gravida et, fringilla ac eros. Sed auctor orci arcu, ultrices ullamcorper nulla porta quis. Cras metus magna, dignissim eget suscipit in, porttitor non dolor. Vestibulum porttitor dapibus turpis, nec convallis est sodales at.

Suspendisse vitae eros leo. Pellentesque orci odio, suscipit at consequat id, vehicula porta risus. Sed rhoncus, arcu imperdiet commodo porta, leo eros sodales lacus, id vehicula tortor arcu sed ex. Vestibulum magna sapien, dapibus eget ipsum ac, accumsan semper nisl. Sed consectetur lectus ut augue euismod accumsan. Maecenas iaculis augue placerat, molestie ipsum ac, egestas sapien. Integer sed mi tellus. Phasellus tempor vulputate sem, et tempor arcu tincidunt vel. Quisque vel quam et est auctor finibus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Quisque id bibendum diam, a consequat mauris. Phasellus in venenatis lacus, a feugiat leo. Quisque convallis ex ac hendrerit fringilla.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi ullamcorper nunc tortor, eu congue mauris rhoncus nec. Proin quis facilisis ex. Fusce eget dignissim turpis. Curabitur eget neque velit. Donec volutpat rhoncus massa eu lacinia. Mauris sed augue mi. Proin egestas mollis lectus sed tristique. Nulla in neque at felis vulputate posuere in vel tellus. Cras et enim pellentesque, fermentum turpis eget, pretium eros.`;

function splitIntoParagraphs(text) {
    return text.split(/\n\n+/);
}

function getSomeRandomNumbers(n) {
    const result = [];
    for (let i = 0; i < n; i++) {
        result.push(Math.random());
    }
    return result;
}

const SOME_NUMBERS = getSomeRandomNumbers(100);

function drawText(text, t) {
    document.body.innerHTML = '';

    let counter = 0;
    let paragraphIndex = 0;
    for (const paragraph of splitIntoParagraphs(text)) {
        const p = document.createElement('p');
        for (const char of paragraph) {
            const span = document.createElement('span');
            span.appendChild(document.createTextNode(
                String.fromCharCode(
                    char.codePointAt(0) - 10 + Math.floor(21 * Math.random())
                )
            ));

            const r = [];
            for (let i = 0; i < 9; i++) {
                r[i] = SOME_NUMBERS[paragraphIndex*5 % SOME_NUMBERS.length];
            }

            const fsin = x => Math.floor(255*Math.sin(x));
            const tau = 2*Math.PI;
            const colorR = fsin(counter*r[0] + t*r[1]*2.0 + tau*r[2]);
            const colorG = fsin(counter*r[3] + t*r[2]*1.7 + tau*r[5]);
            const colorB = fsin(counter*r[6] + t*r[4]*0.5 + tau*r[8]);
            span.style.color = `rgb(${colorR % 256}, ${colorG % 256}, ${colorB % 256})`;
            
            counter += 1;

            p.appendChild(span)
        }
        document.body.appendChild(p);
        paragraphIndex += 1;
    }
}

onload = () => {
    let t = 0;
    setInterval(() => {
        drawText(TEXT, t);
        t += 1;
    }, 20); 
};