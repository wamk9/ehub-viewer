<template>
  <footer class="ehub-footer">
    <span>{{ $t('modules.footer.rights.platform') }}</span><br>
    <i18n-t keypath="modules.footer.rights.credits" tag="span">
      <template #company>
        <a href="https://johnjohn3d.com.br" target="_blank" rel="noopener noreferrer">JohnJohn 3D</a>
      </template>
    </i18n-t>
  </footer>
</template>

<style>
.ehub-footer {
  border-top: 1px solid var(--ehub-line);
  padding: 16px 24px;
  text-align: center;
  color: var(--ehub-muted);
  font-size: .78rem;
  line-height: 1.8;
}
.ehub-footer a {
  color: var(--ehub-primary);
  text-decoration: none;
}
.ehub-footer a:hover {
  text-decoration: underline;
}
</style>
