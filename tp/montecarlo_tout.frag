
layout(location=20) uniform int nb_emissives;
layout(location=21) uniform int NB_BOUNCES;


vec3 sample_hemisphere()
{
    // Algorithme d'échantillonnage uniforme de l'hémisphère
	float cosTheta = random_float();
    float sinTheta = sqrt(1.0f - cosTheta * cosTheta);
    float phi = 2 * PI * random_float();
    vec3 s = normalize(vec3(cos(phi) * sinTheta, sin(phi) * sinTheta, cosTheta));

	return s;
}

vec3 random_ray(in vec3 D)
{
    // Algorithme d'orientation de l'échantillon
	vec3 W = vec3(1,0,0);
	if(abs(D.x) > 0.99)
		W = vec3(0,0,1);
	vec3 U = normalize(cross(D, W));
	vec3 V = normalize(cross(D, U));
	mat3 M = mat3(U, V, D); // Matrice de changement de repère 3x3

    return normalize(M * sample_hemisphere());
}


vec3 random_path(in vec3 D, in vec3 O)
{
	vec3 total = vec3(0);
    float attenu = 1.0;
	for(int i=0; (i<NB_BOUNCES)&&(attenu>0.05); ++i){
		traverse_all_bvh(O,D);
		if (!hit())
            return total + attenu * mix (vec3(0.1,0.1,0.5),vec3(0.4,0.4,0.9),max(0.0,(0.5+D.z)/1.5));
		vec3 N;
        vec3 P;
        intersection_info(N,P);
        vec4 color = intersection_color_info();
        vec4 mat = intersection_mat_info();
        vec3 local = color.rgb * random_ray(N);

        total += (1.0 - ((NB_BOUNCES>1) ? mat.r : 0.0)) * local * attenu;
        attenu *= mat.r;

		O = P+EPSILON*N;
		D = reflect(D, N);
	}
	return total;

}

vec3 raytrace(in vec3 Dir, in vec3 Orig)   
{
	// init de la graine du random
	srand();
	// calcul de la lumière captée par un chemin aléatoire
	return random_path(normalize(Dir),Orig);
}

