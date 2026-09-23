/* Native disclosure fallback; smoothly reversible opening and closing. */
document.querySelectorAll('.fcc-products-menu').forEach(menu => {
  const trigger = menu.querySelector('summary');
  const panel = menu.querySelector('.fcc-mega');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let closeTimer;
  let animation;
  let expanded = menu.open;
  let openedByHover = false;
  trigger.setAttribute('aria-expanded', String(expanded));
  function setExpanded(next) {
    clearTimeout(closeTimer);
    if (next === expanded) return;
    expanded = next;
    const wasVisible = menu.open;
    const current = getComputedStyle(panel);
    const from = wasVisible
    ? {
      opacity: current.opacity, transform: current.transform
    }
    : {
      opacity: '0', transform: 'translateY(-10px)'
    };
    if (animation) {
      animation.cancel();
      animation = null;
    }
    menu.open = true;
    // Keep the disclosure rendered until its exit finishes.
    if (!next && panel.contains(document.activeElement)) trigger.focus({
      preventScroll: true
    });
    panel.inert = !next;
    trigger.setAttribute('aria-expanded', String(next));
    menu.classList.toggle('fcc-menu-expanded', next);
    const finish = () => {
      menu.open = next;
      animation = null;
    };
    if (reducedMotion.matches || !panel.animate) {
      finish();
      return;
    }
    animation = panel.animate([
    from,
    next ? {
      opacity: '1', transform: 'translateY(0)'
    }
    : {
      opacity: '0', transform: 'translateY(-7px)'
    }
    ], {
      duration: next ? 280 : 200,
      easing: next ? 'cubic-bezier(0.22, 1, 0.36, 1)' : 'cubic-bezier(0.4, 0, 1, 1)'
    });
    animation.onfinish = finish;
  }
  menu.classList.add('fcc-menu-enhanced');
  menu.classList.toggle('fcc-menu-expanded', expanded);
  const categories = [...menu.querySelectorAll('.fcc-category-menu')];
  function selectCategory(category) {
    if (category.open) return;
    // Keep focus out of a panel that is about to be hidden by hover.
    const focusedPanel = categories.find(item => item !== category && item.contains(document.activeElement));
    categories.forEach(item => {
      item.open = item === category;
    });
    if (focusedPanel) category.querySelector('summary').focus({
      preventScroll: true
    });
    const content = category.querySelector('.fcc-submenu');
    if (!reducedMotion.matches && content.animate) {
      content.animate([{
        opacity: 0, transform: 'translateX(-5px)'
      },
      {
        opacity: 1, transform: 'translateX(0)'
      }
      ],
      {
        duration: 180, easing: 'ease-out'
      });
    }
  }
  categories.forEach(category => {
    const label = category.querySelector('summary');
    let pointerType = '';
    let wasOpenOnPress = false;
    label.addEventListener('pointerdown', event => {
      pointerType = event.pointerType;
      wasOpenOnPress = category.open;
    });
    label.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') selectCategory(category);
    });
    label.addEventListener('focus', () => selectCategory(category));
    label.addEventListener('click', event => {
      event.preventDefault();
      selectCategory(category);
      // Mouse clicks browse the category. Touch first reveals its options;
      // a second tap browses it. Keyboard users can follow the panel link.
      if (event.detail > 0 && (pointerType === 'mouse' || wasOpenOnPress)) {
        category.querySelector('.fcc-submenu a').click();
      }
      pointerType = '';
      wasOpenOnPress = false;
    });
    category.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' && event.target === label) {
        selectCategory(category);
        category.querySelector('.fcc-submenu a').focus();
        event.preventDefault();
      } else if (event.key === 'ArrowLeft') {
        label.focus();
        event.preventDefault();
      }
    });
  });
  menu.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    clearTimeout(closeTimer);
    if (!expanded) {
      setExpanded(true);
      openedByHover = true;
    }
  });
  menu.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse') return;
    closeTimer = setTimeout(() => {
      if (openedByHover && !menu.contains(document.activeElement)) {
        setExpanded(false);
        openedByHover = false;
      }
    }, 200);
  });
  trigger.addEventListener('click', event => {
    event.preventDefault();
    // The first click after mouse hover pins the already-open menu.
    if (openedByHover && expanded) {
      openedByHover = false;
      clearTimeout(closeTimer);
      return;
    }
    openedByHover = false;
    setExpanded(!expanded);
  });
  menu.addEventListener('focusout', () => {
    setTimeout(() => {
      if (!menu.contains(document.activeElement)) {
        setExpanded(false);
        openedByHover = false;
      }
    }, 0);
  });
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape' && expanded) {
      setExpanded(false);
      openedByHover = false;
      trigger.focus({
        preventScroll: true
      });
      event.preventDefault();
    }
  });
  document.addEventListener('pointerdown', event => {
    if (!menu.contains(event.target)) {
      setExpanded(false);
      openedByHover = false;
    }
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches && animation) animation.finish();
  });
});
