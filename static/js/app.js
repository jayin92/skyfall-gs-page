// JavaScript to handle mouseover and mouseout events
var activeMethodPill = null;
var activeScenePill = null;
var activeModePill = null;
var activeVidID = 0;
var select = true; // 初始值设为 true，这样视频可以正常播放


$(document).ready(function () {
    var editor = CodeMirror.fromTextArea(document.getElementById("bibtex"), {
        lineNumbers: false,
        lineWrapping: true,
        readOnly: true
    });
    // 設定固定高度，例如 150px（可根據需要調整）
    editor.setSize(null, "180px");
    
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    });

    editor.removeTag = CodeMirror.removeTag;
    var cm = $(".CodeMirror");
    cm.editor = editor;
    editor.save();
    editor.setOption("mode", "htmlmixed");

    activeMethodPill = $('.method-pill').filter('.active')[0];
    activeModePill = $('.mode-pill').filter('.active')[0];
    activeScenePill = $('.scene-pill').filter('.active')[0];

    console.log("console activae method pill: ", activeMethodPill)
    console.log("console activae mode pill: ", activeModePill)
    console.log("console activae scene pill: ", activeScenePill)

    // resizeAndPlay($('#sparsity')[0]);
});

function copyBibtex() {
    if (editor) {
        navigator.clipboard.writeText(editor.getValue());
    }
};

function selectCompVideo(methodPill, scenePill, n_views, modePill) {
    // Your existing logic for video selection
    // var video = document.getElementById("compVideo");
    select = true;
    var videoSwitch = document.getElementById("compVideoSwitch");
    var viewNum = document.getElementById("compVideoValue");

    console.log("activate scene pill: ", activeScenePill)
    console.log("activate method pill: ", activeMethodPill)
    console.log("activate mode pill: ", activeModePill)

    // console.log("scene pill: ", scenePill)
    // console.log("method pill: ", methodPill)

    // console.log("method: ", methodPill.getAttribute("data-value"))
    // console.log("pill: ", scenePill.getAttribute("data-value"))
    // console.log("mode: ", modePill.getAttribute("data-value"))

    // console.log("active method pill 2: ", activeMethodPill.classList)

    if (activeMethodPill) {
        activeMethodPill.classList.remove("active");
    }
    if (activeScenePill) {
        activeScenePill.classList.remove("active");
    }
    if (modePill) {
        activeModePill.classList.remove("active");
        modePill.classList.add("active");
        activeModePill = modePill;
    }
    activeMethodPill = methodPill;
    activeScenePill = scenePill;
    methodPill.classList.add("active");
    scenePill.classList.add("active");
    method = methodPill.getAttribute("data-value");
    pill = scenePill.getAttribute("data-value");
    mode = activeModePill.getAttribute("data-value");


    

    // if (videoSwitch.checked) {
    //     mode = 'depth'
    // } else {
    //     mode = 'rgb'
    // }

    // swap video to avoid flickering
    activeVidID = 1 - activeVidID;
    var video_active = document.getElementById("compVideo" + activeVidID);
    var video_hidden = document.getElementById("compVideo" + (1 - activeVidID));
    
    // 设置 preload 属性
    video_active.preload = "metadata";
    
    // video_active.src = "./videos/comparison/" + pill + "_" + method + "_vs_ours_" + mode + ".mp4";
    video_active.src = "./videos/comparison/" + pill + "_" + method + "_vs_ours_" + mode + ".mp4";
    video_active.load();

    if (n_views) {
        viewNum.innerHTML = n_views;
    }
}


function updateMethodVisibility(mode) {
    // 定義每個mode可以顯示的方法列表
    const methodsByMode = {
        'rgb': ['nope-nerf', 'localrf', 'cf3dgs', 'mast3r', 'optimized-mast3r'],
        'depth': ['nope-nerf', 'localrf', 'cf3dgs', 'mast3r', 'optimized-mast3r']
    };

    // 定義每個mode可以顯示的場景列表
    const scenesByMode = {
        'rgb': ['Free_grass', 'Free_hydrant', 'Free_lab', 'Free_pillar', 'Free_road', 'Free_sky', 'Free_stair', 'Hike_forest1', 'Hike_forest2', 'Hike_forest3', 'Hike_garden1', 'Hike_garden2', 'Hike_garden3', 'Hike_indoor', 'Hike_playground', 'Hike_university2', 'Hike_university3', 'Hike_university4', 'Tanks_Barn', 'Tanks_Francis'],
        'depth': ['Free_grass', 'Free_hydrant', 'Free_lab', 'Free_pillar', 'Free_road', 'Free_sky', 'Free_stair', 'Hike_forest1', 'Hike_forest2', 'Hike_forest3', 'Hike_garden1', 'Hike_garden2', 'Hike_garden3', 'Hike_indoor', 'Hike_playground', 'Hike_university2', 'Hike_university3', 'Hike_university4', 'Tanks_Barn', 'Tanks_Francis'],
    };

    const titlesByMode = {
        'rgb': 'LongSplat outperforms other methods.',
        'depth': 'LongSplat outperforms other methods.',
    };

    const descriptByMode = {
        'rgb': "Baseline method (left) vs LongSplat (right).",
        'depth': "Baseline method (left) vs LongSplat (right).",
    }

    const descriptionElement = document.getElementById('description-text');
    if (descriptionElement && descriptByMode[mode]) {
        descriptionElement.innerHTML = descriptByMode[mode];
    }

    // 更新標題
    const titleElement = document.getElementById('title-text');
    if (titleElement && titlesByMode[mode]) {
        titleElement.textContent = titlesByMode[mode];
    }

    // 更新方法按鈕的顯示
    const methodPills = document.querySelectorAll('.method-pill');
    methodPills.forEach(pill => {
        const methodValue = pill.getAttribute('data-value');
        if (methodsByMode[mode].includes(methodValue)) {
            pill.style.display = '';
        } else {
            pill.style.display = 'none';
            if (pill.classList.contains('active')) {
                const firstVisibleMethod = document.querySelector(`.method-pill[data-value="${methodsByMode[mode][0]}"]`);
                if (firstVisibleMethod) {
                    firstVisibleMethod.click();
                }
            }
        }
    });

    // 更新場景的顯示
    const scenePills = document.querySelectorAll('.scene-pill');
    scenePills.forEach(pill => {
        const sceneValue = pill.getAttribute('data-value');
        if (scenesByMode[mode].includes(sceneValue)) {
            pill.style.display = '';
        } else {
            pill.style.display = 'none';
            if (pill.classList.contains('active')) {
                const firstVisibleScene = document.querySelector(`.scene-pill[data-value="${scenesByMode[mode][0]}"]`);
                if (firstVisibleScene) {
                    firstVisibleScene.click();
                }
            }
        }
    });
}