import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '../services/config.service';

export const adminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const configService = inject(ConfigService);
  const router = inject(Router);

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  const user = authService.getCurrentUser();
  if (!user) {
    return router.createUrlTree(['/login']);
  }

  // Check if user is admin by querying profiles table
  const config = configService.getConfig();
  const supabase = createClient(config.supabase.url, config.supabase.anonKey);

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (error || !profile?.is_admin) {
    // Redirect to dashboard if not admin
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
